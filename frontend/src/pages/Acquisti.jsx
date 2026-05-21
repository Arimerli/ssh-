import { useState, useEffect } from "react";
import styles from "./Acquisti.module.css";
import api from "../api/api";
import { getComponenti } from "../api/api";

function Acquisti({ utente }) {
    const [acquisti, setAcquisti] = useState([]);
    const [componenti, setComponenti] = useState([]);
    const [modificando, setModificando] = useState(null);
    const [nuovaQuantita, setNuovaQuantita] = useState("");

    useEffect(() => {
        carica();
        getComponenti().then(res => setComponenti(res.data));
    }, []);

    function carica() {
        api.get("/acquisti/").then(res => setAcquisti(res.data));
    }

    function nomeComponente(id) {
        const c = componenti.find(c => c.id === id);
        return c ? c.nome : "—";
    }

    function formatData(dataStr) {
        const d = new Date(dataStr);
        return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    }

    async function elimina(id) {
        await api.delete(`/acquisti/${id}/`);
        setAcquisti(prev => prev.filter(a => a.id !== id));
    }

    function iniziaModifica(a) {
        setModificando(a.id);
        setNuovaQuantita(a.quantita);
    }

    async function salvaModifica(id) {
        await api.patch(`/acquisti/${id}/`, { quantita: parseInt(nuovaQuantita) });
        setAcquisti(prev => prev.map(a => a.id === id ? { ...a, quantita: parseInt(nuovaQuantita) } : a));
        setModificando(null);
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.titolo}>
                <span className={styles.titoloAccento}>Lista </span>acquisti
            </h1>

            {acquisti.length === 0 && (
                <div className={styles.vuoto}>Nessun componente in lista acquisti</div>
            )}

            <div className={styles.lista}>
                {acquisti.map(a => (
                    <div key={a.id} className={styles.riga}>
                        <div className={styles.rigaNome}>{nomeComponente(a.componente)}</div>

                        <div className={styles.rigaCentro}>
                            {modificando === a.id ? (
                                <div className={styles.modificaInline}>
                                    <input
                                        type="number"
                                        value={nuovaQuantita}
                                        onChange={e => setNuovaQuantita(e.target.value)}
                                        className={styles.inputQuantita}
                                    />
                                    <button className={styles.btnSalva} onClick={() => salvaModifica(a.id)}>Salva</button>
                                    <button className={styles.btnAnnulla} onClick={() => setModificando(null)}>Annulla</button>
                                </div>
                            ) : (
                                <span className={styles.quantita}>{a.quantita} pz</span>
                            )}
                        </div>

                        <div className={styles.rigaDestra}>
                            <span className={styles.data}>{formatData(a.data)}</span>
                            {!modificando || modificando !== a.id ? (
                                <button className={styles.btnModifica} onClick={() => iniziaModifica(a)}>Modifica</button>
                            ) : null}
                            <button className={styles.btnElimina} onClick={() => elimina(a.id)}>✕</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Acquisti;
