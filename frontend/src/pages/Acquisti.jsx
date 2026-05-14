import { useState, useEffect } from "react";
import styles from "./Acquisti.module.css";
import api from "../api/api";
import { getComponenti, getGiacenze } from "../api/api";

function Acquisti({ utente }) {
    const [acquisti, setAcquisti] = useState([]);
    const [componenti, setComponenti] = useState([]);

    useEffect(() => {
        api.get("/acquisti/").then(res => setAcquisti(res.data));
        getComponenti().then(res => setComponenti(res.data));
    }, []);

    function nomeComponente(id) {
        const c = componenti.find(c => c.id === id);
        return c ? c.nome : "—";
    }

    function formatData(dataStr) {
        const d = new Date(dataStr);
        return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    return (
        <div className={styles.container}>
            <div className={styles.griglia}>
                {acquisti.length === 0 && (
                    <div className={styles.vuoto}>Nessun acquisto in lista</div>
                )}
                {acquisti.map(a => (
                    <div key={a.id} className={styles.card}>
                        <div className={styles.nome}>{nomeComponente(a.componente)}</div>
                        <div className={styles.info}>
                            <span className={styles.quantita}>{a.quantita} pz</span>
                            <span className={styles.data}>{formatData(a.data)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Acquisti;
