import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword, getLog, aggiornaUtente, eliminaUtente } from "../api/api";
import api from "../api/api";
import styles from "./Utenti.module.css";
import Fab from "../components/Fab";

function Utenti({ utente }) {
    const navigate = useNavigate();

    const [utenti, setUtenti] = useState([]);
    const [log, setLog] = useState([]);
    const [utenteSelezionato, setUtenteSelezionato] = useState(null);
    const [messaggio, setMessaggio] = useState(null);
    const [errore, setErrore] = useState(null);
    const [utenteEdit, setUtenteEdit] = useState(null);
    const [formEdit, setFormEdit] = useState({ email: "", ruolo: "" });

    useEffect(() => {
        if (utente?.ruolo !== "Amministratore") {
            navigate("/componenti");
            return;
        }
        caricaUtenti();
        getLog().then(res => setLog(res.data));
    }, [utente, navigate]);

    async function caricaUtenti() {
        const res = await api.get("/utenti/");
        setUtenti(res.data);
    }

    function getLogUtente(userId) {
        return log.filter(l => l.utente === userId);
    }

    function apriModifica(u) {
        setUtenteEdit(u.id);
        setFormEdit({
            email: u.email || "",
            ruolo: u.groups?.[0]?.name || ""
        });
    }

    function annullaModifica() {
        setUtenteEdit(null);
        setFormEdit({ email: "", ruolo: "" });
    }

    async function salvaUtente(id) {
        try {
            await aggiornaUtente(id, formEdit);
            setMessaggio("Utente aggiornato con successo");
            setUtenteEdit(null);
            caricaUtenti();
        } catch (e) {
            setErrore("Errore aggiornamento utente");
        }
    }

    async function elimina(id) {
        if (!window.confirm("Eliminare utente?")) return;
        await eliminaUtente(id);
        caricaUtenti();
    }

    async function handleResetPassword(userId) {
        if (!window.confirm("Resettare la password?")) return;
        try {
            await resetPassword(userId);
            setMessaggio("Password resettata e mail inviata!");
        } catch {
            setErrore("Errore reset password");
        }
    }

    return (
        <div className={styles.container}>
            {messaggio && <div className={styles.successo}>{messaggio}</div>}
            {errore && <div className={styles.errore}>{errore}</div>}

            <div className={styles.lista}>
                {utenti.map(u => {
                    const aperto = utenteSelezionato === u.id;
                    const logUtente = getLogUtente(u.id);
                    const isAdmin = u.groups?.[0]?.name === "Amministratore";

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
                                        <div className={styles.emailUtente}>
                                            {u.email || u.username}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardRight}>
                                    {utenteEdit === u.id ? (
                                        <>
                                            <input
                                                className={styles.input}
                                                value={formEdit.email}
                                                onChange={e => setFormEdit({ ...formEdit, email: e.target.value })}
                                            />
                                            <select
                                                className={styles.select}
                                                value={formEdit.ruolo}
                                                onChange={e => setFormEdit({ ...formEdit, ruolo: e.target.value })}
                                            >
                                                <option value="Professore">Professore</option>
                                                <option value="Tecnico">Tecnico</option>
                                            </select>
                                            <button className={styles.btnSalva} onClick={() => salvaUtente(u.id)}>
                                                Salva
                                            </button>
                                            <button className={styles.btnAnnulla} onClick={annullaModifica}>
                                                Annulla
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles.ruoloBadge}>
                                                {u.groups?.[0]?.name || "Nessun ruolo"}
                                            </span>

                                            <button
                                                className={styles.btnLog}
                                                onClick={() => setUtenteSelezionato(aperto ? null : u.id)}
                                            >
                                                {aperto ? "Nascondi log ▲" : "Vedi log ▼"}
                                            </button>

                                            {!isAdmin && (
                                                <>
                                                    <button
                                                        className={styles.btnReset}
                                                        onClick={() => handleResetPassword(u.id)}
                                                    >
                                                        Reset password
                                                    </button>
                                                    <button
                                                        className={styles.btnEdit}
                                                        onClick={() => apriModifica(u)}
                                                    >
                                                        Modifica
                                                    </button>
                                                    <button
                                                        className={styles.btnReset}
                                                        onClick={() => elimina(u.id)}
                                                    >
                                                        Elimina
                                                    </button>
                                                </>
                                            )}
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
                                                    {new Date(l.timestamp).toLocaleString("it-IT")}
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
                ruoli={["Amministratore"]}
            />
        </div>
    );
}

export default Utenti;