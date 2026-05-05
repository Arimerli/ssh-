import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { creaUtente } from "../api/api";
import styles from "./AggiungiComponente.module.css";

function AggiungiUtente() {
    const navigate = useNavigate();
    const [nuovaEmail, setNuovaEmail] = useState("");
    const [nuovoRuolo, setNuovoRuolo] = useState("Professore");
    const [messaggio, setMessaggio] = useState(null);
    const [errore, setErrore] = useState(null);

    async function handleCreaUtente() {
        setMessaggio(null);
        setErrore(null);
        if (!nuovaEmail.trim()) {
            setErrore("Inserisci un'email");
            return;
        }
        try {
            await creaUtente({ email: nuovaEmail, ruolo: nuovoRuolo });
            setMessaggio("Utente creato e mail inviata!");
            setTimeout(() => navigate("/utenti"), 1500);
        } catch (err) {
            setErrore(err.response?.data?.errore || "Errore durante la creazione");
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate("/utenti")}>
                    ← Torna indietro
                </button>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Aggiungi </span>
                    utente
                </h1>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Dati utente</div>
                <div className={styles.campo}>
                    <label className={styles.label}>Email istituzionale</label>
                    <input
                        className={styles.input}
                        type="email"
                        value={nuovaEmail}
                        onChange={e => setNuovaEmail(e.target.value)}
                        placeholder="cognome.nome@fermi.mo.it"
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>Ruolo</label>
                    <select
                        className={styles.select}
                        value={nuovoRuolo}
                        onChange={e => setNuovoRuolo(e.target.value)}
                    >
                        <option value="Professore">Professore</option>
                        <option value="Tecnico">Tecnico</option>
                        <option value="Amministratore">Amministratore</option>
                    </select>
                </div>

                {errore && <div className={styles.errore}>{errore}</div>}
                {messaggio && <div className={styles.successo}>{messaggio}</div>}
            </div>

            <button className={styles.btnSalva} onClick={handleCreaUtente}>
                Crea e invia mail
            </button>
        </div>
    );
}

export default AggiungiUtente;