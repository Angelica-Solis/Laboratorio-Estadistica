const sql = require("mssql/msnodesqlv8");

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,

    options: {
        trustedConnection: false,
        trustServerCertificate: true
    },

    driver: "msnodesqlv8",

    connectionString:
        `Driver={ODBC Driver 17 for SQL Server};` +
        `Server=${process.env.DB_SERVER};` +
        `Database=${process.env.DB_DATABASE};` +
        `UID=${process.env.DB_USER};` +
        `PWD=${process.env.DB_PASSWORD};`
};

const poolPromise = sql.connect(config)
    .then(pool => {
        console.log("Conectado correctamente a SQL Server");
        return pool;
    })
    .catch(error => {
        console.error("Error conectando a SQL Server:");
        console.error(error);
        throw error;
    });

module.exports = {
    sql,
    poolPromise
};