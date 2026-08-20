const express = require("express");

const {
    promedioEstatura,
    promedioPeso,
    hipertension,
    relacionHipertensionPeso,
    relacionSobrepesoTrabajo,
    datosPoblacion,
    intervaloConfianzaEstatura,
    pruebaHipotesisIMC
} = require("../services/estadisticaService");

const router = express.Router();


// =====================================================
// Datos generales de la población
// =====================================================

router.get("/poblacion", async (req, res) => {
    try {
        const resultado = await datosPoblacion();

        res.json(resultado);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo datos de la población"
        });
    }
});


// =====================================================
// a) Promedio de estatura
// =====================================================

router.get("/estatura", async (req, res) => {
    try {
        const resultado =
            await promedioEstatura();

        res.json(resultado);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo promedio de estatura"
        });
    }
});


// =====================================================
// b) Promedio de peso
// =====================================================

router.get("/peso", async (req, res) => {
    try {
        const resultado =
            await promedioPeso();

        res.json(resultado);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo promedio de peso"
        });
    }
});


// =====================================================
// c) Hipertensión
// =====================================================

router.get("/hipertension", async (req, res) => {
    try {
        const resultado =
            await hipertension();

        res.json(resultado);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo datos de hipertensión"
        });
    }
});


// =====================================================
// d) Hipertensión y peso
// =====================================================

router.get("/hipertension-peso", async (req, res) => {
    try {
        const resultado =
            await relacionHipertensionPeso();

        res.json(resultado);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo relación hipertensión-peso"
        });
    }
});


// =====================================================
// e) Sobrepeso y trabajo
// =====================================================

router.get("/sobrepeso-trabajo", async (req, res) => {
    try {
        const resultado =
            await relacionSobrepesoTrabajo();

        res.json(resultado);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error obteniendo relación sobrepeso-trabajo"
        });
    }
});


// =====================================================
// f) Intervalo de confianza
// =====================================================

router.get("/intervalo-estatura", async (req, res) => {
    try {

        const nivelConfianza =
            Number(req.query.confianza || 0.95);

        if (
            nivelConfianza <= 0 ||
            nivelConfianza >= 1
        ) {
            return res.status(400).json({
                error:
                    "El nivel de confianza debe estar entre 0 y 1."
            });
        }

        const resultado =
            await intervaloConfianzaEstatura(
                nivelConfianza
            );

        res.json(resultado);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error calculando el intervalo de confianza."
        });
    }
});


// =====================================================
// g) Prueba de hipótesis del IMC
// =====================================================

router.get("/prueba-imc", async (req, res) => {
    try {

        const imcPoblacional =
            Number(req.query.imc || 25);

        const nivelSignificancia =
            Number(req.query.alpha || 0.05);


        if (imcPoblacional <= 0) {
            return res.status(400).json({
                error:
                    "El IMC poblacional debe ser mayor que 0."
            });
        }


        if (
            nivelSignificancia <= 0 ||
            nivelSignificancia >= 1
        ) {
            return res.status(400).json({
                error:
                    "El nivel de significancia debe estar entre 0 y 1."
            });
        }


        const resultado =
            await pruebaHipotesisIMC(
                imcPoblacional,
                nivelSignificancia
            );

        res.json(resultado);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error:
                "Error realizando la prueba de hipótesis."
        });
    }
});


module.exports = router;