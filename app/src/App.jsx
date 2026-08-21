import { useEffect, useState } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const API = "http://localhost:3000/api/estadisticas";

// Estilos reutilizables para los bloques DATOS / FÓRMULA / PROCEDIMIENTO


const cajaEstilo = {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    marginBottom: "20px",
    boxShadow: "0 8px 30px rgba(31, 41, 55, 0.06)",
    color: "#202536"
};

const tituloCajaEstilo = {
    display: "block",
    fontWeight: 800,
    letterSpacing: "2px",
    fontSize: "13px",
    color: "#4f46e5",
    marginBottom: "16px"
};

const textoClaro = { color: "#596174" };
const textoFuerte = { color: "#202536" };

function App() {
    const [seccion, setSeccion] = useState("inicio");

    // DATOS ESTADÍSTICOs

    const [estatura, setEstatura] = useState(null);
    const [peso, setPeso] = useState(null);
    const [hipertension, setHipertension] = useState(null);
    const [hipPeso, setHipPeso] = useState([]);
    const [sobrepeso, setSobrepeso] = useState([]);

    // EJERCICIO 1

    const [confianza, setConfianza] = useState(98);
    const [intervalo, setIntervalo] = useState(null);

    // EJERCICIO 2

    const [imcPoblacional, setImcPoblacional] = useState(25);
    const [significancia, setSignificancia] = useState(5);
    const [hipotesis, setHipotesis] = useState(null);

    // INTEGRANTES

    const integrantes = ["María Angélica Solís", "Dereck Alonso Jiménez", "Dilan Sanchez", "Abraham"];

    // ESTADO DE CARGA

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // CARGA INICIAL

    useEffect(() => {
        let activo = true;

        const iniciar = async () => {
            try {
                setCargando(true);
                setError("");

                const [
                    respuestaEstatura,
                    respuestaPeso,
                    respuestaHipertension,
                    respuestaHipPeso,
                    respuestaSobrepeso,
                    respuestaIntervalo,
                    respuestaHipotesis
                ] = await Promise.all([
                    axios.get(`${API}/estatura`),
                    axios.get(`${API}/peso`),
                    axios.get(`${API}/hipertension`),
                    axios.get(`${API}/hipertension-peso`),
                    axios.get(`${API}/sobrepeso-trabajo`),
                    axios.get(`${API}/intervalo-estatura?confianza=0.98`),
                    axios.get(`${API}/prueba-imc?imc=25&alpha=0.05`)
                ]);

                if (!activo) return;

                setEstatura(respuestaEstatura.data);
                setPeso(respuestaPeso.data);
                setHipertension(respuestaHipertension.data);
                setHipPeso(respuestaHipPeso.data);
                setSobrepeso(respuestaSobrepeso.data);
                setIntervalo(respuestaIntervalo.data);
                setHipotesis(respuestaHipotesis.data);

            } catch (error) {
                console.error("Error cargando datos:", error);

                if (activo) {
                    setError(
                        "No se pudieron cargar los datos. Verifique que el servidor API esté ejecutándose."
                    );
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        };

        iniciar();

        return () => {
            activo = false;
        };
    }, []);

    // CALCULAR INTERVALO DE CONFIANZA

    const calcularIntervalo = async (nivel) => {
        try {
            setConfianza(nivel);

            const respuesta = await axios.get(
                `${API}/intervalo-estatura?confianza=${nivel / 100}`
            );

            setIntervalo(respuesta.data);

        } catch (error) {
            console.error("Error calculando intervalo:", error);
            setError("No se pudo calcular el intervalo de confianza.");
        }
    };

    // CALCULAR HIPÓTESIS

    const calcularHipotesis = async () => {
        try {
            setError("");

            const respuesta = await axios.get(
                `${API}/prueba-imc?imc=${imcPoblacional}&alpha=${significancia / 100}`
            );

            setHipotesis(respuesta.data);

        } catch (error) {
            console.error("Error calculando hipótesis:", error);
            setError("No se pudo realizar la prueba de hipótesis.");
        }
    };

    // MENÚ

    const menu = [
        ["inicio", "Inicio"],
        ["ejercicio1", "Ejercicio 1"],
        ["ejercicio2", "Ejercicio 2"],
        ["interactiva", "Parte interactiva"]
    ];

    // PANTALLA DE CARGA

    if (cargando) {
        return (
            <div className="app">
                <header className="navbar">
                    <div className="logo">
                        Laboratorio de Estadística
                    </div>
                </header>

                <main>
                    <section className="pagina carga">
                        <div className="cargando">
                            <div className="spinner"></div>
                            <h2>Cargando datos...</h2>
                            <p>
                                Conectando con la base de datos y calculando
                                los resultados estadísticos.
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="app">

            {/*NAVBAR*/}

            <header className="navbar">

                <div className="logo">
                    <span></span>
                    Laboratorio de Estadística
                </div>

                <nav>
                    {menu.map(([id, nombre]) => (
                        <button
                            key={id}
                            className={seccion === id ? "activo" : ""}
                            onClick={() => setSeccion(id)}
                        >
                            {nombre}
                        </button>
                    ))}
                </nav>

            </header>

            {/*ERROR*/}

            {error && (
                <div className="mensaje-error">
                    ⚠️ {error}
                </div>
            )}

            <main>

                {/*INICIO*/}

                {seccion === "inicio" && (
                    <>
                        <section className="hero">

                            <div className="hero-text">

                                <span className="etiqueta">
                                    ANÁLISIS ESTADÍSTICO
                                </span>

                                <h1>
                                    Laboratorio de
                                    <br />
                                    <strong>Estadística</strong>
                                </h1>

                                <p>
                                    Análisis estadístico de una población de
                                    40 personas mediante cálculos, pruebas
                                    estadísticas y visualizaciones.
                                </p>

                                <button
                                    className="boton-principal"
                                    onClick={() => setSeccion("interactiva")}
                                >
                                    Ver resultados →
                                </button>

                            </div>

                            <div className="hero-card-col">

                                <div className="hero-card">

                                    <div className="hero-icon">
                                        📈
                                    </div>

                                    <h2>40 personas</h2>

                                    <p>Datos analizados</p>

                                    <div className="mini-stats">

                                        <div>
                                            <strong>20</strong>
                                            <span>Hombres</span>
                                        </div>

                                        <div>
                                            <strong>20</strong>
                                            <span>Mujeres</span>
                                        </div>

                                    </div>

                                </div>

                                <p className="hero-card-firma">
                                    {integrantes.map((nombre, indice) => (
                                        <span key={indice}>{nombre}</span>
                                    ))}
                                </p>

                            </div>

                        </section>
                    </>
                )}

                {/* EJERCICIO 1 */}

                {seccion === "ejercicio1" && (
                    <section className="pagina">

                        <span className="etiqueta">
                            EJERCICIO 1
                        </span>

                        <h1>
                            Intervalo de confianza
                        </h1>

                        <p className="descripcion">
                            Determine el intervalo de confianza al
                            <strong> 98%</strong> para la diferencia entre
                            los promedios de estatura de mujeres y hombres.
                        </p>

                        {intervalo && (
                            <>

                                {/* ==========================================
                    DATOS
                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        DATOS
                                    </span>

                                    <p style={textoClaro}>
                                        Para resolver el ejercicio se separaron los registros
                                        de la base de datos según el sexo de cada persona.
                                        La muestra 1 corresponde a las mujeres y la muestra 2
                                        corresponde a los hombres.
                                    </p>

                                    <div className="grid-resultados">

                                        <Dato
                                            titulo="Nivel de confianza"
                                            valor={`${intervalo.nivelConfianza}%`}
                                        />

                                        <Dato
                                            titulo="n₁ Mujeres"
                                            valor={intervalo.mujeres.n}
                                        />

                                        <Dato
                                            titulo="n₂ Hombres"
                                            valor={intervalo.hombres.n}
                                        />

                                    </div>

                                </div>


                                {/* ==========================================
                    MEDIA MUESTRAL
                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        MEDIA MUESTRAL
                                    </span>

                                    <p style={textoClaro}>
                                        Para obtener la media muestral de cada grupo,
                                        se suman todas las estaturas y el resultado se
                                        divide entre la cantidad de personas de la muestra.
                                    </p>

                                    {/* Fórmula x̄ = Σxi / n */}

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontSize: "1.4rem",
                                            fontFamily: "Georgia, serif",
                                            padding: "10px 0",
                                            color: "#4f46e5"
                                        }}
                                    >
                                        <span>x̄</span>

                                        <span>=</span>

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.3
                                            }}
                                        >
                                            <span
                                                style={{
                                                    padding: "0 8px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                Σxᵢ
                                            </span>

                                            <span style={{ padding: "0 8px" }}>
                                                n
                                            </span>

                                        </span>

                                    </div>

                                    <div className="grid-resultados">

                                        <Dato
                                            titulo="x̄₁ Mujeres"
                                            valor={`${intervalo.mujeres.promedio.toFixed(4)} m`}
                                        />

                                        <Dato
                                            titulo="x̄₂ Hombres"
                                            valor={`${intervalo.hombres.promedio.toFixed(4)} m`}
                                        />

                                    </div>

                                </div>


                                {/* ==========================================
                    VARIANZA Y DESVIACIÓN
                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        VARIANZA Y DESVIACIÓN ESTÁNDAR
                                    </span>

                                    <p style={textoClaro}>
                                        Una vez obtenida la media de cada grupo,
                                        se calcula la varianza muestral. La varianza
                                        permite conocer qué tan dispersas se encuentran
                                        las estaturas con respecto a la media.
                                    </p>

                                    {/* Fórmula de varianza */}

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontSize: "1.4rem",
                                            fontFamily: "Georgia, serif",
                                            padding: "10px 0",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <span>s²</span>

                                        <span>=</span>

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.3
                                            }}
                                        >

                                            <span
                                                style={{
                                                    padding: "0 8px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                Σ(xᵢ − x̄)²
                                            </span>

                                            <span style={{ padding: "0 8px" }}>
                                                n − 1
                                            </span>

                                        </span>

                                    </div>

                                    <p style={textoClaro}>
                                        Posteriormente, la desviación estándar se obtiene
                                        calculando la raíz cuadrada de la varianza.
                                    </p>

                                    <div
                                        style={{
                                            textAlign: "center",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.4rem",
                                            color: "#4f46e5",
                                            padding: "10px 0"
                                        }}
                                    >
                                        s = √s²
                                    </div>

                                    <div className="grid-resultados">

                                        <Dato
                                            titulo="s₁ Mujeres"
                                            valor={intervalo.mujeres.desviacion.toFixed(4)}
                                        />

                                        <Dato
                                            titulo="s₂ Hombres"
                                            valor={intervalo.hombres.desviacion.toFixed(4)}
                                        />

                                        <Dato
                                            titulo="s₁² Mujeres"
                                            valor={intervalo.mujeres.varianza.toFixed(5)}
                                        />

                                        <Dato
                                            titulo="s₂² Hombres"
                                            valor={intervalo.hombres.varianza.toFixed(5)}
                                        />

                                    </div>

                                </div>


                                {/* ==========================================
                    MÉTODO
                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        MÉTODO UTILIZADO
                                    </span>

                                    <p style={textoClaro}>
                                        El ejercicio busca determinar la diferencia entre
                                        el promedio de estatura de las mujeres y el promedio
                                        de estatura de los hombres. Por esta razón se utiliza
                                        una estimación de la diferencia entre dos medias.
                                    </p>

                                    <p style={textoClaro}>
                                        Como el enunciado no proporciona las varianzas
                                        poblacionales, estas se consideran desconocidas.
                                        Las varianzas muestrales obtenidas son:
                                    </p>

                                    <div className="grid-resultados">

                                        <Dato
                                            titulo="Varianza mujeres s₁²"
                                            valor={intervalo.mujeres.varianza.toFixed(5)}
                                        />

                                        <Dato
                                            titulo="Varianza hombres s₂²"
                                            valor={intervalo.hombres.varianza.toFixed(5)}
                                        />

                                    </div>

                                    <p style={textoClaro}>
                                        Debido a que ambas varianzas tienen valores bastante
                                        cercanos, para este procedimiento se consideran
                                        <strong> varianzas poblacionales desconocidas e iguales</strong>.
                                    </p>

                                    <p style={textoClaro}>
                                        Por esta razón se utiliza la distribución
                                        <strong> t de Student</strong>.
                                    </p>

                                </div>


                                {/* ==========================================
                    GRADOS DE LIBERTAD
                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        GRADOS DE LIBERTAD
                                    </span>

                                    <p style={textoClaro}>
                                        Para dos muestras independientes con varianzas
                                        desconocidas e iguales, los grados de libertad se
                                        calculan mediante:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            gl = n₁ + n₂ − 2
                                        </div>

                                        <div>
                                            gl = {intervalo.mujeres.n}
                                            {" + "}
                                            {intervalo.hombres.n}
                                            {" − 2"}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            gl = {intervalo.gradosLibertad.toFixed(0)}
                                        </div>

                                    </div>

                                </div>


                                {/* ==========================================
                    NIVEL DE ERROR Y COLAS
                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        NIVEL DE ERROR Y DIVISIÓN DE COLAS
                                    </span>

                                    <p style={textoClaro}>
                                        El nivel de confianza es de
                                        {" "}
                                        <strong>{intervalo.nivelConfianza}%</strong>.
                                        Por lo tanto, el nivel de error corresponde al
                                        porcentaje restante:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "8px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            100% − {intervalo.nivelConfianza}% ={" "}
                                            {(intervalo.alfa * 100).toFixed(0)}%
                                        </div>

                                        <div>
                                            α = {intervalo.alfa.toFixed(2)}
                                        </div>

                                    </div>

                                    <p style={textoClaro}>
                                        Como el intervalo posee un límite inferior y un
                                        límite superior, el error se divide entre las dos
                                        colas de la distribución:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontSize: "1.3rem",
                                            fontFamily: "Georgia, serif",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <span>α / 2</span>

                                        <span>=</span>

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.3
                                            }}
                                        >

                                            <span
                                                style={{
                                                    padding: "0 8px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                {intervalo.alfa.toFixed(2)}
                                            </span>

                                            <span style={{ padding: "0 8px" }}>
                                                2
                                            </span>

                                        </span>

                                        <span>=</span>

                                        <span style={{ fontWeight: 700 }}>
                                            {intervalo.alfaDosColas.toFixed(2)}
                                        </span>

                                    </div>

                                    <p style={textoClaro}>
                                        Esto significa que existe un
                                        {" "}
                                        <strong>
                                            {(intervalo.alfaDosColas * 100).toFixed(0)}%
                                        </strong>
                                        {" "}
                                        en cada cola.
                                    </p>

                                    <p style={textoClaro}>
                                        Para obtener la probabilidad acumulada utilizada
                                        en la distribución t de Student se suma el 98%
                                        de confianza con una de las colas:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "8px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            98% + 1% = 99%
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            99% = {intervalo.probabilidadAcumulada.toFixed(2)}
                                        </div>

                                    </div>

                                </div>


                                {/*T CRÍTICO*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        VALOR CRÍTICO t
                                    </span>

                                    <p style={textoClaro}>
                                        Como la tabla t de Student utilizada no contiene
                                        exactamente 38 grados de libertad, se obtiene el valor
                                        crítico mediante Microsoft Excel.
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            =INV.T(
                                            {intervalo.probabilidadAcumulada.toFixed(2)};
                                            {intervalo.gradosLibertad.toFixed(0)})
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            t = {intervalo.tCritico.toFixed(4)}
                                        </div>

                                    </div>

                                </div>


                                {/* VARIANZA COMBINADA*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        VARIANZA COMBINADA
                                    </span>

                                    <p style={textoClaro}>
                                        Como se trabaja con dos muestras independientes
                                        con varianzas desconocidas e iguales, es necesario
                                        calcular una varianza combinada de ambas muestras.
                                    </p>

                                    {/* Fórmula general */}

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontSize: "1.3rem",
                                            fontFamily: "Georgia, serif",
                                            padding: "10px 0",
                                            color: "#4f46e5",
                                            flexWrap: "wrap"
                                        }}
                                    >

                                        <span>sₚ²</span>

                                        <span>=</span>

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.4
                                            }}
                                        >

                                            <span
                                                style={{
                                                    padding: "0 10px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                (n₁ − 1)s₁² + (n₂ − 1)s₂²
                                            </span>

                                            <span style={{ padding: "0 10px" }}>
                                                n₁ + n₂ − 2
                                            </span>

                                        </span>

                                    </div>


                                    {/* Sustitución */}

                                    <p style={textoClaro}>
                                        Sustituyendo los valores:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontSize: "1.15rem",
                                            fontFamily: "Georgia, serif",
                                            color: "#4f46e5",
                                            flexWrap: "wrap"
                                        }}
                                    >

                                        <span>sₚ²</span>

                                        <span>=</span>

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.4
                                            }}
                                        >

                                            <span
                                                style={{
                                                    padding: "0 8px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                ({intervalo.mujeres.n} − 1)
                                                ({intervalo.mujeres.varianza.toFixed(5)})
                                                {" + "}
                                                ({intervalo.hombres.n} − 1)
                                                ({intervalo.hombres.varianza.toFixed(5)})
                                            </span>

                                            <span style={{ padding: "0 8px" }}>
                                                {intervalo.gradosLibertad.toFixed(0)}
                                            </span>

                                        </span>

                                    </div>

                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginTop: "16px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5",
                                            fontWeight: 700
                                        }}
                                    >
                                        sₚ² = {intervalo.varianzaCombinada.toFixed(5)}
                                    </div>

                                </div>


                                {/* DESVIACIÓN COMBINADA*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        DESVIACIÓN ESTÁNDAR COMBINADA
                                    </span>

                                    <p style={textoClaro}>
                                        Una vez obtenida la varianza combinada,
                                        se calcula su raíz cuadrada para obtener
                                        la desviación estándar combinada.
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            sₚ = √sₚ²
                                        </div>

                                        <div>
                                            sₚ = √{intervalo.varianzaCombinada.toFixed(5)}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            sₚ = {intervalo.desviacionCombinada.toFixed(4)}
                                        </div>

                                    </div>

                                </div>


                                {/*DIFERENCIA DE MEDIAS */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        DIFERENCIA ENTRE LAS MEDIAS
                                    </span>

                                    <p style={textoClaro}>
                                        Como la muestra 1 corresponde a las mujeres y
                                        la muestra 2 a los hombres, se calcula:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            x̄₁ − x̄₂
                                        </div>

                                        <div>
                                            {intervalo.mujeres.promedio.toFixed(4)}
                                            {" − "}
                                            {intervalo.hombres.promedio.toFixed(4)}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            x̄₁ − x̄₂ = {intervalo.diferencia.toFixed(4)} m
                                        </div>

                                    </div>

                                </div>


                                {/* ERROR ESTÁNDAR*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        ERROR ESTÁNDAR
                                    </span>

                                    <p style={textoClaro}>
                                        El error estándar para la diferencia entre
                                        dos medias con varianzas desconocidas e iguales
                                        se calcula mediante:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.3rem",
                                            color: "#4f46e5",
                                            flexWrap: "wrap"
                                        }}
                                    >

                                        <span>EE = sₚ √(</span>

                                        {/* 1/n1 */}

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.2
                                            }}
                                        >

                                            <span
                                                style={{
                                                    padding: "0 5px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                1
                                            </span>

                                            <span>
                                                n₁
                                            </span>

                                        </span>

                                        <span>+</span>

                                        {/* 1/n2 */}

                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.2
                                            }}
                                        >

                                            <span
                                                style={{
                                                    padding: "0 5px",
                                                    borderBottom: "2px solid #4f46e5"
                                                }}
                                            >
                                                1
                                            </span>

                                            <span>
                                                n₂
                                            </span>

                                        </span>

                                        <span>)</span>

                                    </div>

                                    <p style={textoClaro}>
                                        Sustituyendo:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.15rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            EE = {intervalo.desviacionCombinada.toFixed(4)}
                                            {" × √(1/"}
                                            {intervalo.mujeres.n}
                                            {" + 1/"}
                                            {intervalo.hombres.n}
                                            {")"}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            EE = {intervalo.errorEstandar.toFixed(4)}
                                        </div>

                                    </div>

                                </div>


                                {/*MARGEN DE ERROR*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        MARGEN DE ERROR
                                    </span>

                                    <p style={textoClaro}>
                                        El margen de error se obtiene multiplicando
                                        el valor crítico t por el error estándar.
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >

                                        <div>
                                            E = t × EE
                                        </div>

                                        <div>
                                            E = {intervalo.tCritico.toFixed(4)}
                                            {" × "}
                                            {intervalo.errorEstandar.toFixed(4)}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            E = {intervalo.margenError.toFixed(4)}
                                        </div>

                                    </div>

                                </div>


                                {/*FÓRMULA FINAL*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        FÓRMULA DEL INTERVALO DE CONFIANZA
                                    </span>

                                    <p style={textoClaro}>
                                        Una vez obtenidos todos los datos necesarios,
                                        se utiliza la fórmula del intervalo de confianza
                                        para la diferencia entre dos medias con varianzas
                                        poblacionales desconocidas e iguales:
                                    </p>

                                    <div
                                        style={{
                                            textAlign: "center",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.3rem",
                                            color: "#4f46e5",
                                            padding: "12px 0"
                                        }}
                                    >
                                        (x̄₁ − x̄₂) ± t · sₚ · √(1/n₁ + 1/n₂)
                                    </div>

                                </div>


                                {/*PROCEDIMIENTO FINAL*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        PROCEDIMIENTO
                                    </span>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "12px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.15rem",
                                            color: "#4f46e5",
                                            textAlign: "center"
                                        }}
                                    >

                                        <div>
                                            ({intervalo.mujeres.promedio.toFixed(4)}
                                            {" − "}
                                            {intervalo.hombres.promedio.toFixed(4)})
                                            {" ± "}
                                            {intervalo.tCritico.toFixed(4)}
                                            {" × "}
                                            {intervalo.desviacionCombinada.toFixed(4)}
                                            {" × √(1/"}
                                            {intervalo.mujeres.n}
                                            {" + 1/"}
                                            {intervalo.hombres.n}
                                            {")"}
                                        </div>

                                        <div>
                                            {intervalo.diferencia.toFixed(4)}
                                            {" ± "}
                                            {intervalo.margenError.toFixed(4)}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            {intervalo.limiteInferior.toFixed(4)}
                                            {" < μ₁ − μ₂ < "}
                                            {intervalo.limiteSuperior.toFixed(4)}
                                        </div>

                                    </div>

                                </div>


                                {/* RESULTADO FINAL*/}

                                <div className="resultado-principal">

                                    <div className="resultado-grande">

                                        <span>
                                            Intervalo de confianza del{" "}
                                            {intervalo.nivelConfianza}%
                                        </span>

                                        <strong>
                                            [
                                            {intervalo.limiteInferior.toFixed(4)}
                                            {" ; "}
                                            {intervalo.limiteSuperior.toFixed(4)}
                                            ] m
                                        </strong>

                                    </div>

                                </div>


                                {/* INTERPRETACIÓN*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        INTERPRETACIÓN
                                    </span>

                                    <p style={textoClaro}>
                                        Con un nivel de confianza del
                                        {" "}
                                        <strong>
                                            {intervalo.nivelConfianza}%
                                        </strong>
                                        , se estima que la diferencia entre el promedio
                                        de estatura de las mujeres y el promedio de estatura
                                        de los hombres se encuentra entre
                                        {" "}
                                        <strong>
                                            {intervalo.limiteInferior.toFixed(4)} m
                                        </strong>
                                        {" "}y{" "}
                                        <strong>
                                            {intervalo.limiteSuperior.toFixed(4)} m
                                        </strong>.
                                    </p>

                                    <p style={textoClaro}>
                                        La estimación puntual de la diferencia entre ambas
                                        medias es de
                                        {" "}
                                        <strong>
                                            {intervalo.diferencia.toFixed(4)} m
                                        </strong>.
                                    </p>

                                    <p style={textoClaro}>
                                        Como el intervalo de confianza incluye el valor 0,
                                        no se puede afirmar, con un nivel de confianza del
                                        {" "}
                                        <strong>
                                            {intervalo.nivelConfianza}%
                                        </strong>
                                        , que exista una diferencia estadísticamente
                                        significativa entre la estatura promedio de las
                                        mujeres y la de los hombres.
                                    </p>
                                </div>
                            </>
                        )}

                    </section>
                )}

                {/*EJERCICIO 2*/}

                {seccion === "ejercicio2" && (
                    <section className="pagina">

                        <span className="etiqueta">
                            EJERCICIO 2
                        </span>

                        <h1>
                            Prueba de hipótesis
                        </h1>

                        <p className="descripcion">
                            Determine si el promedio de IMC de la muestra
                            es <strong>mejor</strong> (menor) que el promedio
                            poblacional de <strong>25</strong>, utilizando un
                            nivel de significancia del <strong>5%</strong>
                            (prueba unilateral izquierda: H0: μ ≥ 25 vs
                            H1: μ &lt; 25). Como la desviación estándar
                            poblacional es desconocida y se estima a partir
                            de la muestra, se utiliza la distribución{" "}
                            <strong>t de Student</strong>.
                        </p>

                        {hipotesis && (
                            <>

                                {/*DATOS*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        DATOS
                                    </span>

                                    <p style={textoClaro}>
                                        Se toma la muestra de 40 personas y se calcula
                                        el IMC promedio y su desviación estándar.
                                    </p>

                                    <div className="grid-resultados">

                                        <Dato
                                            titulo="Promedio poblacional (μ)"
                                            valor={hipotesis.imcPoblacional}
                                        />

                                        <Dato
                                            titulo="Nivel de significancia (α)"
                                            valor={hipotesis.nivelSignificancia}
                                        />

                                        <Dato
                                            titulo="Tamaño de la muestra (n)"
                                            valor={hipotesis.n}
                                        />

                                        <Dato
                                            titulo="Media muestral (x̄)"
                                            valor={hipotesis.mediaMuestral.toFixed(4)}
                                        />

                                        <Dato
                                            titulo="Desviación estándar (s)"
                                            valor={hipotesis.desviacion.toFixed(4)}
                                        />

                                        <Dato
                                            titulo="Grados de libertad (gl)"
                                            valor={hipotesis.gradosLibertad}
                                        />

                                    </div>

                                    <p style={{ marginTop: "16px", ...textoClaro }}>
                                        Hipótesis (prueba unilateral izquierda):
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "24px",
                                            flexWrap: "wrap"
                                        }}
                                    >
                                        <strong style={textoFuerte}>
                                            H0: {hipotesis.hipotesisNula}
                                        </strong>

                                        <strong style={textoFuerte}>
                                            H1: {hipotesis.hipotesisAlternativa}
                                        </strong>
                                    </div>

                                </div>

                                {/*FÓRMULA*/}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        FÓRMULA
                                    </span>

                                    <p style={textoClaro}>
                                        Como se desconoce la desviación estándar
                                        poblacional y se estima con la desviación
                                        muestral, el estadístico de prueba sigue una
                                        distribución t de Student con gl = n − 1
                                        grados de libertad:
                                    </p>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "10px",
                                            fontSize: "1.4rem",
                                            fontFamily: "Georgia, serif",
                                            padding: "8px 0",
                                            color: "#4f46e5"
                                        }}
                                    >
                                        <span>t</span>
                                        <span>=</span>
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                lineHeight: 1.3,
                                                color: "#4f46e5"
                                            }}
                                        >
                                            <span
                                                style={{
                                                    padding: "0 6px",
                                                    borderBottom: "2px solid #4f46e5",
                                                    color: "#4f46e5"
                                                }}
                                            >
                                                x̄ − μ
                                            </span>
                                            <span style={{ padding: "0 6px", color: "#4f46e5" }}>
                                                s / √n
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* ==========================================
                                    GRADOS DE LIBERTAD Y VALOR CRÍTICO
                                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        GRADOS DE LIBERTAD Y VALOR CRÍTICO
                                    </span>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5"
                                        }}
                                    >
                                        <div>
                                            gl = n − 1 = {hipotesis.n} − 1
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            gl = {hipotesis.gradosLibertad}
                                        </div>
                                    </div>

                                    <p style={{ marginTop: "16px", ...textoClaro }}>
                                        Como la prueba es unilateral izquierda, el valor
                                        crítico t se obtiene con α ={" "}
                                        {hipotesis.nivelSignificancia} y gl ={" "}
                                        {hipotesis.gradosLibertad} directamente en la
                                        cola izquierda de la distribución:
                                    </p>

                                    <div
                                        style={{
                                            textAlign: "center",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.2rem",
                                            color: "#4f46e5",
                                            fontWeight: 700
                                        }}
                                    >
                                        t crítico = {hipotesis.tCritico.toFixed(4)}
                                    </div>
                                </div>

                                {/* ==========================================
                                    PROCEDIMIENTO
                                ========================================== */}

                                <div style={cajaEstilo}>

                                    <span style={tituloCajaEstilo}>
                                        PROCEDIMIENTO
                                    </span>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "10px",
                                            fontFamily: "Georgia, serif",
                                            fontSize: "1.15rem",
                                            color: "#4f46e5",
                                            textAlign: "center"
                                        }}
                                    >
                                        <div>
                                            t = ({hipotesis.mediaMuestral.toFixed(4)}
                                            {" − "}
                                            {hipotesis.imcPoblacional}) / (
                                            {hipotesis.desviacion.toFixed(4)}
                                            {" / √"}
                                            {hipotesis.n})
                                        </div>

                                        <div>
                                            t = {(
                                                hipotesis.mediaMuestral -
                                                hipotesis.imcPoblacional
                                            ).toFixed(4)} / {hipotesis.errorEstandar.toFixed(4)}
                                        </div>

                                        <div style={{ fontWeight: 700 }}>
                                            t = {hipotesis.estadisticoT.toFixed(4)}
                                        </div>
                                    </div>

                                    <p style={{ marginTop: "16px", ...textoClaro }}>
                                        t = {hipotesis.estadisticoT.toFixed(4)}{" "}
                                        {hipotesis.rechazarHipotesis
                                            ? "es menor que"
                                            : "no es menor que"}{" "}
                                        t crítico ={" "}
                                        <strong style={textoFuerte}>
                                            {hipotesis.tCritico.toFixed(4)}
                                        </strong>
                                    </p>
                                </div>

                                {/* ==========================================
                                    RESULTADO FINAL
                                ========================================== */}

                                <div className="resultado-principal">

                                    <div
                                        className={
                                            hipotesis.rechazarHipotesis
                                                ? "decision rechazar"
                                                : "decision aceptar"
                                        }
                                    >

                                        <span>
                                            {hipotesis.rechazarHipotesis
                                                ? "Se rechaza H0"
                                                : "No se rechaza H0"}
                                        </span>

                                        <strong>
                                            {hipotesis.conclusion}
                                        </strong>

                                        <p style={{ margin: "10px 0 0", fontSize: "14px" }}>
                                            valor p = {hipotesis.pValue.toFixed(4)}
                                        </p>

                                    </div>

                                </div>

                            </>
                        )}

                    </section>
                )}

                {/*PARTE INTERACTIVA*/}

                {seccion === "interactiva" && (
                    <section className="pagina">

                        <span className="etiqueta">
                            PARTE 3 · INTERACTIVA
                        </span>

                        <h1>
                            Análisis estadístico
                        </h1>

                        <p className="descripcion">
                            Consulte los resultados de los diferentes
                            análisis estadísticos realizados sobre las
                            40 personas de la base de datos.
                        </p>

                        {/* A Y B */}

                        <div className="cards">

                            <Card titulo="A. Promedio de estatura">

                                {estatura && (
                                    <>
                                        <Dato
                                            titulo="General"
                                            valor={`${estatura.promedioGeneral.toFixed(2)} m`}
                                        />

                                        <Dato
                                            titulo="Hombres"
                                            valor={`${estatura.promedioHombres.toFixed(2)} m`}
                                        />

                                        <Dato
                                            titulo="Mujeres"
                                            valor={`${estatura.promedioMujeres.toFixed(2)} m`}
                                        />
                                    </>
                                )}

                            </Card>

                            <Card titulo="B. Promedio de peso">

                                {peso && (
                                    <>
                                        <Dato
                                            titulo="General"
                                            valor={`${peso.promedioGeneral.toFixed(2)} kg`}
                                        />

                                        <Dato
                                            titulo="Hombres"
                                            valor={`${peso.promedioHombres.toFixed(2)} kg`}
                                        />

                                        <Dato
                                            titulo="Mujeres"
                                            valor={`${peso.promedioMujeres.toFixed(2)} kg`}
                                        />
                                    </>
                                )}

                            </Card>
                            {/*  C */}

                            <Card titulo="C. Hipertensión">

                                {hipertension && (
                                    <>
                                        <Dato
                                            titulo="Personas con hipertensión"
                                            valor={hipertension.hipertensos}
                                        />

                                        <Dato
                                            titulo="Porcentaje"
                                            valor={`${hipertension.porcentaje.toFixed(1)}%`}
                                        />

                                        <Dato
                                            titulo="Hombres"
                                            valor={hipertension.hipertensosHombres}
                                        />

                                        <Dato
                                            titulo="Mujeres"
                                            valor={hipertension.hipertensosMujeres}
                                        />
                                    </>
                                )}

                            </Card>

                        </div>

                        {/*  D */}

                        <div className="graficos">

                            <div className="grafico-card">

                                <h2>
                                    D. Hipertensión y peso
                                </h2>

                                <p>
                                    Comparación del peso promedio entre
                                    personas con y sin hipertensión.
                                </p>

                                {hipPeso.length > 0 && (
                                    <Bar
                                        data={{
                                            labels: hipPeso.map(
                                                item => item.estado
                                            ),
                                            datasets: [
                                                {
                                                    label: "Peso promedio (kg)",
                                                    data: hipPeso.map(x => Number(x.pesoPromedio)),
                                                    backgroundColor: [
                                                        "#7c3aed",
                                                        "#c4b5fd"
                                                    ],
                                                    borderColor: [
                                                        "#6d28d9",
                                                        "#a78bfa"
                                                    ],
                                                    borderWidth: 2,
                                                    borderRadius: 8
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true
                                        }}
                                    />
                                )}

                            </div>

                            {/* C */}

                            <div className="grafico-card">

                                <h2>
                                    C. Distribución de hipertensión
                                </h2>

                                <p>
                                    Distribución de personas según
                                    su estado de hipertensión.
                                </p>

                                {hipertension && (
                                    <Doughnut
                                        data={{
                                            labels: [
                                                "Hipertensión",
                                                "Sin hipertensión"
                                            ],
                                            datasets: [
                                                {
                                                    data: [
                                                        hipertension.hipertensos,
                                                        hipertension.totalPersonas -
                                                        hipertension.hipertensos
                                                    ],
                                                    backgroundColor: [
                                                        "#ef4444",
                                                        "#cbd5e1"
                                                    ],
                                                    borderColor: [
                                                        "#dc2626",
                                                        "#94a3b8"
                                                    ],
                                                    borderWidth: 2
                                                }
                                            ]
                                        }}
                                    />
                                )}

                            </div>

                        </div>

                        {/* E */}

                        <div className="grafico-card completo">

                            <h2>
                                E. Sobrepeso y profesión
                            </h2>

                            <p>
                                Se considera sobrepeso cuando el IMC
                                es mayor o igual a 25.
                            </p>

                            {sobrepeso.length > 0 && (
                                <Bar
                                    data={{
                                        labels: sobrepeso.map(
                                            item => item.Trabajo
                                        ),
                                        datasets: [
                                            {
                                                label: "Personas con sobrepeso",
                                                data: sobrepeso.map(x => Number(x.personasSobrepeso)),
                                                backgroundColor: "#f59e0b",
                                                borderColor: "#d97706",
                                                borderWidth: 2,
                                                borderRadius: 8
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true
                                    }}
                                />
                            )}

                        </div>

                        {/* F */}

                        <section className="interactivo">

                            <span className="etiqueta">
                                F. INTERVALO DE CONFIANZA
                            </span>

                            <h2>
                                Diferencia de estaturas
                            </h2>

                            <p>
                                Cambie el nivel de confianza y observe
                                cómo cambia el intervalo.
                            </p>

                            <div className="controles">

                                <label>
                                    Nivel de confianza

                                    <select
                                        value={confianza}
                                        onChange={e =>
                                            calcularIntervalo(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value="90">
                                            90%
                                        </option>

                                        <option value="95">
                                            95%
                                        </option>

                                        <option value="98">
                                            98%
                                        </option>

                                        <option value="99">
                                            99%
                                        </option>

                                    </select>

                                </label>

                            </div>

                            {intervalo && (
                                <div className="intervalo">

                                    <div>
                                        <span>
                                            Límite inferior
                                        </span>

                                        <strong>
                                            {intervalo.limiteInferior.toFixed(4)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Diferencia
                                        </span>

                                        <strong>
                                            {intervalo.diferencia.toFixed(4)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Límite superior
                                        </span>

                                        <strong>
                                            {intervalo.limiteSuperior.toFixed(4)}
                                        </strong>
                                    </div>

                                </div>
                            )}

                        </section>

                        {/* G */}

                        <section className="interactivo">

                            <span className="etiqueta">
                                G. PRUEBA DE HIPÓTESIS
                            </span>

                            <h2>
                                Promedio de IMC
                            </h2>

                            <p>
                                Modifique el promedio poblacional y el
                                nivel de significancia para realizar
                                nuevamente la prueba.
                            </p>

                            <div className="controles">

                                <label>
                                    IMC poblacional

                                    <input
                                        type="number"
                                        min="1"
                                        step="0.1"
                                        value={imcPoblacional}
                                        onChange={e =>
                                            setImcPoblacional(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </label>

                                <label>
                                    Nivel de significancia

                                    <select
                                        value={significancia}
                                        onChange={e =>
                                            setSignificancia(
                                                Number(e.target.value)
                                            )
                                        }
                                    >

                                        <option value="1">
                                            1%
                                        </option>

                                        <option value="5">
                                            5%
                                        </option>

                                        <option value="10">
                                            10%
                                        </option>

                                    </select>

                                </label>

                                <button
                                    className="boton-principal"
                                    onClick={calcularHipotesis}
                                >
                                    Calcular
                                </button>

                            </div>

                            {hipotesis && (
                                <div
                                    className={
                                        hipotesis.rechazarHipotesis
                                            ? "decision rechazar"
                                            : "decision aceptar"
                                    }
                                >

                                    <span>
                                        Resultado
                                    </span>

                                    <strong>
                                        {hipotesis.conclusion}
                                    </strong>

                                    <p>
                                        t ={" "}
                                        {hipotesis.estadisticoT.toFixed(4)}
                                        {"   |   "}
                                        p ={" "}
                                        {hipotesis.pValue.toFixed(4)}
                                    </p>

                                </div>
                            )}

                        </section>

                    </section>
                )}

            </main>

            <footer>
                Laboratorio de Estadística · Análisis de datos
            </footer>

        </div>
    );
}

// COMPONENTE DATO

function Dato({ titulo, valor }) {
    return (
        <div className="dato">
            <span>{titulo}</span>
            <strong>{valor}</strong>
        </div>
    );
}



function Card({ titulo, children }) {
    return (
        <div className="stat-card">

            <h2>
                {titulo}
            </h2>

            {children}

        </div>
    );
}

export default App;