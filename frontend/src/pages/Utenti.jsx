import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword, getLog } from "../api/api";
import api from "../api/api";
import styles from "./Utenti.module.css";
import Fab from "../components/Fab";
import { aggiornaUtente, eliminaUtente } from "../api/api";

function Utenti({ utente }) {
    const navigate = useNavigate();
    const [utenti, setUtenti] = useState([]);
    const [log, setLog] = useState([]);
    const [utenteSelezionato, setUtenteSelezionato] = useState(null);
    const [messaggio, setMessaggio] = useState(null);
    const [errore, setErrore] = useState(null);

    useEffect(() => {
        if (utente?.ruolo !== 'Amministratore') {
            navigate("/componenti");
            return;
        }
        caricaUtenti();
        getLog().then(res => setLog(res.data));
    }, []);

    async function salvaUtente(id, data) {
        await aggiornaUtente(id, data);
    }

    async function elimina(id) {
        if (!window.confirm("Eliminare utente?")) return;
        await eliminaUtente(id);
        caricaUtenti();
    }

    async function caricaUtenti() {
        const res = await api.get("/utenti/");
        setUtenti(res.data);
    }

    async function handleResetPassword(userId) {
        if (!window.confirm("Resettare la password di questo utente?")) return;
        try {
            await resetPassword(userId);
            setMessaggio("Password resettata e mail inviata!");
        } catch (err) {
            setErrore("Errore durante il reset");
        }
    }

    function getLogUtente(userId) {
        return log.filter(l => l.utente === userId);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Gestione </span>
                    utenti
                </h1>
            </div>

            {messaggio && <div className={styles.successo}>{messaggio}</div>}
            {errore && <div className={styles.errore}>{errore}</div>}

            <div className={styles.lista}>
                {utenti.map(u => {
                    const aperto = utenteSelezionato === u.id;
                    const logUtente = getLogUtente(u.id);

                    return (
                        <div key={u.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {(u.first_name?.[0] || u.username?.[0] || "?").toUpperCase()}
                                    </div>
                                    <div>
                                        <div className={styles.nomeUtente}>
                                            {u.first_name} {u.last_name}
                                        </div>
                                        <div className={styles.emailUtente}>{u.email || u.username}</div>
                                    </div>
                                </div>
                                <div className={styles.cardRight}>
                                    <span className={styles.ruoloBadge}>
                                        {u.groups?.[0]?.name || "Nessun ruolo"}
                                    </span>
                                    <button
                                        className={styles.btnReset}
                                        onClick={() => handleResetPassword(u.id)}
                                    >
                                        Reset password
                                    </button>
                                    <button
                                        className={styles.btnLog}
                                        onClick={() => setUtenteSelezionato(aperto ? null : u.id)}
                                    >
                                        {aperto ? "Nascondi log ▲" : "Vedi log ▼"}
                                    </button>
                                    {utente?.ruolo === "Amministratore" && (
                                        <>
                                            <button onClick={() => salvaUtente(u.id, {
                                                email: u.email,
                                                first_name: u.first_name,
                                                last_name: u.last_name
                                            })}>
                                                Salva
                                            </button>

                                            <button onClick={() => elimina(u.id)}>
                                                Elimina
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {aperto && (
                                <div className={styles.logArea}>
                                    <div className={styles.logTitolo}>Attività recenti</div>
                                    {logUtente.length === 0 ? (
                                        <div className={styles.logVuoto}>Nessuna attività registrata</div>
                                    ) : (
                                        logUtente.slice(0, 20).map(l => (
                                            <div key={l.id} className={styles.logRiga}>
                                                <span className={styles.logAzione}>{l.azione}</span>
                                                <span className={styles.logOggetto}>{l.oggetto}</span>
                                                <span className={styles.logData}>
                                                    {new Date(l.timestamp).toLocaleString('it-IT')}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <Fab
                destination="/utenti/aggiungi"
                utente={utente}
                ruoli={['Amministratore']}
            />
        </div>
    );
}

export default Utenti;