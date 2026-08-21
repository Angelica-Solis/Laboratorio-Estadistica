const { sql, poolPromise } = require("../database/connection");
const { jStat } = require("jstat");

// a) PROMEDIO DE ESTATURA 

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


// b) PROMEDIO DE PESO

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


// c) HIPERTENSIÓN 

async function hipertension() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            COUNT(*) AS totalPersonas,

            SUM(
                CASE
                    WHEN CAST(
                        LEFT(
                            Presion_arterial,
                            CHARINDEX('/', Presion_arterial) - 1
                        ) AS INT
                    ) >= 140
                    OR CAST(
                        SUBSTRING(
                            Presion_arterial,
                            CHARINDEX('/', Presion_arterial) + 1,
                            LEN(Presion_arterial)
                        ) AS INT
                    ) >= 90
                    THEN 1
                    ELSE 0
                END
            ) AS hipertensos,

            SUM(
                CASE
                    WHEN Sexo = 'M'
                    AND (
                        CAST(
                            LEFT(
                                Presion_arterial,
                                CHARINDEX('/', Presion_arterial) - 1
                            ) AS INT
                        ) >= 140
                        OR CAST(
                            SUBSTRING(
                                Presion_arterial,
                                CHARINDEX('/', Presion_arterial) + 1,
                                LEN(Presion_arterial)
                            ) AS INT
                        ) >= 90
                    )
                    THEN 1
                    ELSE 0
                END
            ) AS hipertensosHombres,

            SUM(
                CASE
                    WHEN Sexo = 'F'
                    AND (
                        CAST(
                            LEFT(
                                Presion_arterial,
                                CHARINDEX('/', Presion_arterial) - 1
                            ) AS INT
                        ) >= 140
                        OR CAST(
                            SUBSTRING(
                                Presion_arterial,
                                CHARINDEX('/', Presion_arterial) + 1,
                                LEN(Presion_arterial)
                            ) AS INT
                        ) >= 90
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
        porcentaje:
            (datos.hipertensos / datos.totalPersonas) * 100,
        hipertensosHombres: datos.hipertensosHombres,
        hipertensosMujeres: datos.hipertensosMujeres
    };
}


// d) RELACIÓN ENTRE HIPERTENSIÓN Y PESO

async function relacionHipertensionPeso() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            CASE
                WHEN CAST(
                    LEFT(
                        Presion_arterial,
                        CHARINDEX('/', Presion_arterial) - 1
                    ) AS INT
                ) >= 140
                OR CAST(
                    SUBSTRING(
                        Presion_arterial,
                        CHARINDEX('/', Presion_arterial) + 1,
                        LEN(Presion_arterial)
                    ) AS INT
                ) >= 90
                THEN 'Hipertensión'
                ELSE 'Sin hipertensión'
            END AS estado,

            COUNT(*) AS cantidad,
            AVG(Peso_kg) AS pesoPromedio

        FROM Personas

        GROUP BY
            CASE
                WHEN CAST(
                    LEFT(
                        Presion_arterial,
                        CHARINDEX('/', Presion_arterial) - 1
                    ) AS INT
                ) >= 140
                OR CAST(
                    SUBSTRING(
                        Presion_arterial,
                        CHARINDEX('/', Presion_arterial) + 1,
                        LEN(Presion_arterial)
                    ) AS INT
                ) >= 90
                THEN 'Hipertensión'
                ELSE 'Sin hipertensión'
            END
    `);

    return result.recordset;
}


// e) SOBREPESO SEGÚN HORAS DE TRABAJO Y PROFESIÓN

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

        GROUP BY
            Trabajo,
            Horas_trabajo_dia

        ORDER BY
            Trabajo,
            Horas_trabajo_dia
    `);

    return result.recordset;
}


// DATOS GENERALES DE LA POBLACIÓN

async function datosPoblacion() {
    const pool = await poolPromise;

    const result = await pool.request().query(`
        SELECT
            COUNT(*) AS totalPersonas,

            SUM(
                CASE
                    WHEN Sexo = 'M' THEN 1
                    ELSE 0
                END
            ) AS hombres,

            SUM(
                CASE
                    WHEN Sexo = 'F' THEN 1
                    ELSE 0
                END
            ) AS mujeres

        FROM Personas
    `);

    return result.recordset[0];
}


// f) INTERVALO DE CONFIANZA PARA LA DIFERENCIA DE ESTATURAS

async function intervaloConfianzaEstatura(nivelConfianza = 0.98) {
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

    const mujeres = result.recordset.find(x => x.Sexo === "F");
    const hombres = result.recordset.find(x => x.Sexo === "M");


    const nMujeres = Number(mujeres.n);
    const nHombres = Number(hombres.n);


    const mediaMujeres = Number(mujeres.media);
    const mediaHombres = Number(hombres.media);


    const sdMujeres = Number(mujeres.desviacion);
    const sdHombres = Number(hombres.desviacion);

    // Diferencia de medias: Mujeres - Hombres

    const diferencia = mediaMujeres - mediaHombres;

    // Varianzas muestrales

    const varianzaMujeres = sdMujeres ** 2;
    const varianzaHombres = sdHombres ** 2;


    // Grados de libertad

    const gradosLibertad =
        nMujeres + nHombres - 2;


    // Varianza combinada


    const varianzaCombinada =
        (
            (nMujeres - 1) * varianzaMujeres +
            (nHombres - 1) * varianzaHombres
        )
        /
        gradosLibertad;


    // Desviación estándar combinada


    const desviacionCombinada =
        Math.sqrt(varianzaCombinada);


    // Nivel de error


    const alfa =
        1 - nivelConfianza;

    const alfaDosColas =
        alfa / 2;

    const probabilidadAcumulada =
        1 - alfaDosColas;


    // Valor crítico t de Student


    const tCritico = jStat.studentt.inv(
        probabilidadAcumulada,
        gradosLibertad
    );



    // Error estándar para dos medias con varianzas desconocidas e iguales


    const errorEstandar =
        desviacionCombinada *
        Math.sqrt(
            (1 / nMujeres) +
            (1 / nHombres)
        );


    // Margen de error


    const margenError =
        tCritico * errorEstandar;


    // Intervalo de confianza


    const limiteInferior =
        diferencia - margenError;

    const limiteSuperior =
        diferencia + margenError;


    return {
        nivelConfianza: nivelConfianza * 100,

        alfa,
        alfaDosColas,
        probabilidadAcumulada,

        mujeres: {
            n: nMujeres,
            promedio: mediaMujeres,
            desviacion: sdMujeres,
            varianza: varianzaMujeres
        },

        hombres: {
            n: nHombres,
            promedio: mediaHombres,
            desviacion: sdHombres,
            varianza: varianzaHombres
        },

        diferencia,

        varianzaCombinada,
        desviacionCombinada,

        errorEstandar,

        gradosLibertad,

        tCritico,

        margenError,

        limiteInferior,
        limiteSuperior
    };
}

// g) PRUEBA DE HIPÓTESIS DEL IMC
async function pruebaHipotesisIMC(
    imcPoblacional = 25,
    nivelSignificancia = 0.05
) {
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

    const mediaMuestral =
        Number(datos.media);

    const desviacion =
        Number(datos.desviacion);

    // Prueba de una cola (unilateral izquierda)
    //
    // H0: μ >= IMC poblacional
    // H1: μ < IMC poblacional

    const errorEstandar =
        desviacion / Math.sqrt(n);

    const z =
        (mediaMuestral - imcPoblacional) /
        errorEstandar;

    const gradosLibertad =
        n - 1;

    // P-value

    const pValue =
        jStat.normal.cdf(z, 0, 1);

    // Z crítico

    const zCritico =
        jStat.normal.inv(
            nivelSignificancia,
            0,
            1
        );

    // Decisión

    const rechazarHipotesis =
        z < zCritico;

    return {

        hipotesisNula:
            `μ ≥ ${imcPoblacional}`,

        hipotesisAlternativa:
            `μ < ${imcPoblacional}`,

        tipoPrueba:
            "unilateral izquierda (Z, muestra grande)",

        imcPoblacional,

        nivelSignificancia,

        n,

        mediaMuestral,

        desviacion,

        errorEstandar,

        estadisticoZ: z,

        gradosLibertad,

        zCritico,

        pValue,

        rechazarHipotesis,

        conclusion:
            rechazarHipotesis

                ? `Se rechaza H0: con un ${nivelSignificancia * 100
                }% de significancia hay evidencia suficiente de que el IMC promedio de la muestra es menor (mejor) que el poblacional de ${imcPoblacional}.`

                : `No se rechaza H0: con un ${nivelSignificancia * 100
                }% de significancia NO hay evidencia suficiente de que el IMC promedio de la muestra sea menor (mejor) que el poblacional de ${imcPoblacional}.`
    };
}



module.exports = {
    promedioEstatura,
    promedioPeso,
    hipertension,
    relacionHipertensionPeso,
    relacionSobrepesoTrabajo,
    datosPoblacion,
    intervaloConfianzaEstatura,
    pruebaHipotesisIMC
};