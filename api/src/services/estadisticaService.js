const { sql, poolPromise } = require("../database/connection");
const { jStat } = require("jstat");


// a) Promedio de estatura
async function promedioEstatura() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            AVG(Estatura_m) AS promedioGeneral,
            AVG(CASE WHEN Sexo = 'M' THEN Estatura_m END) AS promedioHombres,
            AVG(CASE WHEN Sexo = 'F' THEN Estatura_m END) AS promedioMujeres
        FROM Personas
    `);

    return result.recordset[0];
}

// b) Promedio de peso
async function promedioPeso() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            AVG(Peso_kg) AS promedioGeneral,
            AVG(CASE WHEN Sexo = 'M' THEN Peso_kg END) AS promedioHombres,
            AVG(CASE WHEN Sexo = 'F' THEN Peso_kg END) AS promedioMujeres
        FROM Personas
    `);

    return result.recordset[0];
}

// c) Hipertensión
async function hipertension() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            COUNT(*) AS totalPersonas,

            SUM(
                CASE
                    WHEN CAST(LEFT(Presion_arterial, CHARINDEX('/', Presion_arterial) - 1) AS INT) >= 140
                      OR CAST(SUBSTRING(
                            Presion_arterial,
                            CHARINDEX('/', Presion_arterial) + 1,
                            LEN(Presion_arterial)
                          ) AS INT) >= 90
                    THEN 1
                    ELSE 0
                END
            ) AS hipertensos,

            SUM(
                CASE
                    WHEN Sexo = 'M'
                     AND (
                        CAST(LEFT(Presion_arterial, CHARINDEX('/', Presion_arterial) - 1) AS INT) >= 140
                        OR CAST(SUBSTRING(
                            Presion_arterial,
                            CHARINDEX('/', Presion_arterial) + 1,
                            LEN(Presion_arterial)
                        ) AS INT) >= 90
                     )
                    THEN 1
                    ELSE 0
                END
            ) AS hipertensosHombres,

            SUM(
                CASE
                    WHEN Sexo = 'F'
                     AND (
                        CAST(LEFT(Presion_arterial, CHARINDEX('/', Presion_arterial) - 1) AS INT) >= 140
                        OR CAST(SUBSTRING(
                            Presion_arterial,
                            CHARINDEX('/', Presion_arterial) + 1,
                            LEN(Presion_arterial)
                        ) AS INT) >= 90
                     )
                    THEN 1
                    ELSE 0
                END
            ) AS hipertensosMujeres

        FROM Personas
    `);

    const datos = result.recordset[0];

    return {
        totalPersonas: datos.totalPersonas,
        hipertensos: datos.hipertensos,
        porcentaje: (datos.hipertensos / datos.totalPersonas) * 100,
        hipertensosHombres: datos.hipertensosHombres,
        hipertensosMujeres: datos.hipertensosMujeres
    };
}

// d) Relación entre hipertensión y peso
async function relacionHipertensionPeso() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            CASE
                WHEN CAST(LEFT(Presion_arterial, CHARINDEX('/', Presion_arterial) - 1) AS INT) >= 140
                  OR CAST(SUBSTRING(
                        Presion_arterial,
                        CHARINDEX('/', Presion_arterial) + 1,
                        LEN(Presion_arterial)
                      ) AS INT) >= 90
                THEN 'Hipertensión'
                ELSE 'Sin hipertensión'
            END AS estado,

            COUNT(*) AS cantidad,
            AVG(Peso_kg) AS pesoPromedio

        FROM Personas

        GROUP BY
            CASE
                WHEN CAST(LEFT(Presion_arterial, CHARINDEX('/', Presion_arterial) - 1) AS INT) >= 140
                  OR CAST(SUBSTRING(
                        Presion_arterial,
                        CHARINDEX('/', Presion_arterial) + 1,
                        LEN(Presion_arterial)
                      ) AS INT) >= 90
                THEN 'Hipertensión'
                ELSE 'Sin hipertensión'
            END
    `);

    return result.recordset;
}

// e) Sobrepeso vs horas de trabajo y profesión
async function relacionSobrepesoTrabajo() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            Trabajo,
            Horas_trabajo_dia,
            COUNT(*) AS cantidad,
            AVG(IMC) AS imcPromedio,

            SUM(
                CASE
                    WHEN IMC >= 25 THEN 1
                    ELSE 0
                END
            ) AS personasSobrepeso

        FROM Personas

        GROUP BY Trabajo, Horas_trabajo_dia

        ORDER BY Trabajo, Horas_trabajo_dia
    `);

    return result.recordset;
}
// f) Intervalo de confianza para la diferencia de estaturas
async function intervaloConfianzaEstatura(nivelConfianza = 0.95) {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            Sexo,
            COUNT(*) AS n,
            AVG(Estatura_m) AS media,
            STDEV(Estatura_m) AS desviacion
        FROM Personas
        WHERE Sexo IN ('M', 'F')
        GROUP BY Sexo
    `);

    const hombres = result.recordset.find(x => x.Sexo === "M");
    const mujeres = result.recordset.find(x => x.Sexo === "F");

    const nHombres = Number(hombres.n);
    const nMujeres = Number(mujeres.n);

    const mediaHombres = Number(hombres.media);
    const mediaMujeres = Number(mujeres.media);

    const sdHombres = Number(hombres.desviacion);
    const sdMujeres = Number(mujeres.desviacion);

    // Diferencia: hombres - mujeres
    const diferencia = mediaHombres - mediaMujeres;

    // Error estándar de Welch
    const errorEstandar = Math.sqrt(
        (sdHombres ** 2 / nHombres) +
        (sdMujeres ** 2 / nMujeres)
    );

    // Grados de libertad de Welch
    const numerador =
        ((sdHombres ** 2 / nHombres) +
            (sdMujeres ** 2 / nMujeres)) ** 2;

    const denominador =
        ((sdHombres ** 2 / nHombres) ** 2 / (nHombres - 1)) +
        ((sdMujeres ** 2 / nMujeres) ** 2 / (nMujeres - 1));

    const gradosLibertad = numerador / denominador;

    // Alfa
    const alfa = 1 - nivelConfianza;

    // Valor crítico bilateral
    const tCritico = jStat.studentt.inv(
        1 - alfa / 2,
        gradosLibertad
    );

    const margenError = tCritico * errorEstandar;

    const limiteInferior = diferencia - margenError;
    const limiteSuperior = diferencia + margenError;

    return {
        nivelConfianza: nivelConfianza * 100,
        alfa,
        hombres: {
            n: nHombres,
            promedio: mediaHombres,
            desviacion: sdHombres
        },
        mujeres: {
            n: nMujeres,
            promedio: mediaMujeres,
            desviacion: sdMujeres
        },
        diferencia,
        errorEstandar,
        gradosLibertad,
        tCritico,
        margenError,
        limiteInferior,
        limiteSuperior
    };
}


// g) Prueba de hipótesis del IMC
async function pruebaHipotesisIMC(imcPoblacional = 25, nivelSignificancia = 0.05) {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            COUNT(*) AS n,
            AVG(IMC) AS media,
            STDEV(IMC) AS desviacion
        FROM Personas
        WHERE IMC IS NOT NULL
    `);

    const datos = result.recordset[0];

    const n = Number(datos.n);
    const mediaMuestral = Number(datos.media);
    const desviacion = Number(datos.desviacion);

    // H0: μ = IMC poblacional
    // H1: μ ≠ IMC poblacional

    const errorEstandar = desviacion / Math.sqrt(n);

    const t = (mediaMuestral - imcPoblacional) / errorEstandar;

    const gradosLibertad = n - 1;

    // Prueba bilateral
    const pValue =
        2 * (1 - jStat.studentt.cdf(Math.abs(t), gradosLibertad));

    const tCritico = jStat.studentt.inv(
        1 - nivelSignificancia / 2,
        gradosLibertad
    );

    const rechazarHipotesis = Math.abs(t) > tCritico;

    return {
        hipotesisNula: `μ = ${imcPoblacional}`,
        hipotesisAlternativa: `μ ≠ ${imcPoblacional}`,

        imcPoblacional,
        nivelSignificancia,

        n,
        mediaMuestral,
        desviacion,
        errorEstandar,

        estadisticoT: t,
        gradosLibertad,

        tCritico,
        pValue,

        rechazarHipotesis,

        conclusion: rechazarHipotesis
            ? "Se rechaza la hipótesis nula."
            : "No se rechaza la hipótesis nula."
    };
}
module.exports = {
    promedioEstatura,
    promedioPeso,
    hipertension,
    relacionHipertensionPeso,
    relacionSobrepesoTrabajo,
    intervaloConfianzaEstatura,
    pruebaHipotesisIMC
};