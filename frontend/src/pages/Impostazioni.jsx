import { useState } from "react";
import { cambiaPassword, aggiornaProfiloUtente } from "../api/api";
import styles from "./Impostazioni.module.css";

function Impostazioni({ utente, setUtente }) {

    const [vecchiaPassword, setVecchiaPassword] = useState("");
    const [nuovaPassword, setNuovaPassword] = useState("");
    const [confermaPassword, setConfermaPassword] = useState("");
    const [messaggioPassword, setMessaggioPassword] = useState(null);
    const [errorePassword, setErrorePassword] = useState(null);
    const [messaggioEmail, setMessaggioEmail] = useState(null);
    const [erroreEmail, setErroreEmail] = useState(null);

    async function handleCambiaPassword() {
        setMessaggioPassword(null);
        setErrorePassword(null);

        if (nuovaPassword !== confermaPassword) {
            setErrorePassword("Le password non coincidono");
            return;
        }

        if (nuovaPassword.length < 8) {
            setErrorePassword("La nuova password deve essere di almeno 8 caratteri");
            return;
        }

        try {
            await cambiaPassword(vecchiaPassword, nuovaPassword);
            setMessaggioPassword("Password cambiata con successo!");
            setVecchiaPassword("");
            setNuovaPassword("");
            setConfermaPassword("");
        } catch (err) {
            setErrorePassword(err.response?.data?.errore || "Errore durante il cambio password");
        }
    }



    return (
        <div className={styles.container}>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Il tuo account</div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Username</span>
                    <span className={styles.infoValore}>{utente?.username}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Ruolo</span>
                    <span className={styles.infoValore}>{utente?.ruolo || "Nessun ruolo"}</span>
                </div>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Cambia password</div>
                <div className={styles.campo}>
                    <label className={styles.label}>Password attuale</label>
                    <input
                        className={styles.input}
                        type="password"
                        value={vecchiaPassword}
                        onChange={e => setVecchiaPassword(e.target.value)}
                        placeholder="Inserisci la password attuale"
                        autoComplete="new-password"
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>Nuova password</label>
                    <input
                        className={styles.input}
                        type="password"
                        value={nuovaPassword}
                        onChange={e => setNuovaPassword(e.target.value)}
                        placeholder="Inserisci la nuova password"
                        autoComplete="new-password"
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>Conferma nuova password</label>
                    <input
                        className={styles.input}
                        type="password"
                        value={confermaPassword}
                        onChange={e => setConfermaPassword(e.target.value)}
                        placeholder="Ripeti la nuova password"
                        onKeyDown={e => e.key === "Enter" && handleCambiaPassword()}
                        autoComplete="new-password"
                    />
                </div>
                {errorePassword && <div className={styles.errore}>{errorePassword}</div>}
                {messaggioPassword && <div className={styles.successo}>{messaggioPassword}</div>}
                <button className={styles.bottone} onClick={handleCambiaPassword}>
                    Salva nuova password
                </button>
            </div>
        </div>
    );
}

export default Impostazioni;