const express = require("express");
const cors = require("cors");
require("dotenv").config();

const estadisticaRoutes = require("./routes/estadisticaRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Laboratorio de Estadística funcionando"
    });
});

app.use("/api/estadisticas", estadisticaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});