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

function App() {
    const [seccion, setSeccion] = useState("inicio");

    // =========================
    // DATOS ESTADÍSTICOS
    // =========================

    const [estatura, setEstatura] = useState(null);
    const [peso, setPeso] = useState(null);
    const [hipertension, setHipertension] = useState(null);
    const [hipPeso, setHipPeso] = useState([]);
    const [sobrepeso, setSobrepeso] = useState([]);

    // =========================
    // EJERCICIO 1
    // =========================

    const [confianza, setConfianza] = useState(98);
    const [intervalo, setIntervalo] = useState(null);

    // =========================
    // EJERCICIO 2
    // =========================

    const [imcPoblacional, setImcPoblacional] = useState(25);
    const [significancia, setSignificancia] = useState(5);
    const [hipotesis, setHipotesis] = useState(null);

    // =========================
    // ESTADO DE CARGA
    // =========================

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // CARGA INICIAL
    // =====================================================

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

    // =====================================================
    // CALCULAR INTERVALO DE CONFIANZA
    // =====================================================

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

    // =====================================================
    // CALCULAR HIPÓTESIS
    // =====================================================

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

    // =====================================================
    // MENÚ
    // =====================================================

    const menu = [
        ["inicio", "Inicio"],
        ["ejercicio1", "Ejercicio 1"],
        ["ejercicio2", "Ejercicio 2"],
        ["interactiva", "Parte interactiva"]
    ];

    // =====================================================
    // PANTALLA DE CARGA
    // =====================================================

    if (cargando) {
        return (
            <div className="app">
                <header className="navbar">
                    <div className="logo">
                        📊 Laboratorio de Estadística
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

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="navbar">

                <div className="logo">
                    <span>📊</span>
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

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="mensaje-error">
                    ⚠️ {error}
                </div>
            )}

            <main>

                {/* =================================================
                    INICIO
                ================================================= */}

                {seccion === "inicio" && (
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

                    </section>
                )}

                {/* =================================================
                    EJERCICIO 1
                ================================================= */}

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
                            <strong> 98%</strong> para la diferencia de
                            los promedios de las estaturas entre hombres
                            y mujeres.
                        </p>

                        {intervalo && (
                            <div className="resultado-principal">

                                <div className="resultado-grande">

                                    <span>
                                        Intervalo de confianza del 98%
                                    </span>

                                    <strong>
                                        [
                                        {intervalo.limiteInferior.toFixed(4)}
                                        {" ; "}
                                        {intervalo.limiteSuperior.toFixed(4)}
                                        ]
                                    </strong>

                                </div>

                                <div className="grid-resultados">

                                    <Dato
                                        titulo="Promedio hombres"
                                        valor={`${intervalo.hombres.promedio.toFixed(4)} m`}
                                    />

                                    <Dato
                                        titulo="Promedio mujeres"
                                        valor={`${intervalo.mujeres.promedio.toFixed(4)} m`}
                                    />

                                    <Dato
                                        titulo="Diferencia"
                                        valor={`${intervalo.diferencia.toFixed(4)} m`}
                                    />

                                    <Dato
                                        titulo="Error estándar"
                                        valor={intervalo.errorEstandar.toFixed(4)}
                                    />

                                    <Dato
                                        titulo="Margen de error"
                                        valor={intervalo.margenError.toFixed(4)}
                                    />

                                    <Dato
                                        titulo="Grados de libertad"
                                        valor={intervalo.gradosLibertad.toFixed(2)}
                                    />

                                </div>

                            </div>
                        )}

                    </section>
                )}

                {/* =================================================
                    EJERCICIO 2
                ================================================= */}

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
                            es diferente al promedio poblacional de
                            <strong> 25</strong>, utilizando un nivel de
                            significancia del <strong>5%</strong>.
                        </p>

                        {hipotesis && (
                            <div className="resultado-principal">

                                <div
                                    className={
                                        hipotesis.rechazarHipotesis
                                            ? "decision rechazar"
                                            : "decision aceptar"
                                    }
                                >

                                    <span>
                                        Conclusión
                                    </span>

                                    <strong>
                                        {hipotesis.conclusion}
                                    </strong>

                                </div>

                                <div className="grid-resultados">

                                    <Dato
                                        titulo="IMC poblacional"
                                        valor={hipotesis.imcPoblacional}
                                    />

                                    <Dato
                                        titulo="Media muestral"
                                        valor={hipotesis.mediaMuestral.toFixed(4)}
                                    />

                                    <Dato
                                        titulo="Desviación estándar"
                                        valor={hipotesis.desviacion.toFixed(4)}
                                    />

                                    <Dato
                                        titulo="Estadístico t"
                                        valor={hipotesis.estadisticoT.toFixed(4)}
                                    />

                                    <Dato
                                        titulo="Valor p"
                                        valor={hipotesis.pValue.toFixed(4)}
                                    />

                                    <Dato
                                        titulo="t crítico"
                                        valor={hipotesis.tCritico.toFixed(4)}
                                    />

                                </div>

                            </div>
                        )}

                    </section>
                )}

                {/* =================================================
                    PARTE INTERACTIVA
                ================================================= */}

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

                        {/* ==========================================
                            A Y B
                        ========================================== */}

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

                        {/* ==========================================
                            D
                        ========================================== */}

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

                            {/* ======================================
                                C
                            ====================================== */}

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

                        {/* ==========================================
                            E
                        ========================================== */}

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

                        {/* ==========================================
                            F
                        ========================================== */}

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

                        {/* ==========================================
                            G
                        ========================================== */}

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

// =====================================================
// COMPONENTE DATO
// =====================================================

function Dato({ titulo, valor }) {
    return (
        <div className="dato">
            <span>{titulo}</span>
            <strong>{valor}</strong>
        </div>
    );
}

// =====================================================
// COMPONENTE CARD
// =====================================================

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