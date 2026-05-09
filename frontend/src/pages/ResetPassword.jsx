import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { richiediResetPassword } from "../api/api";
import styles from "./Login.module.css";

function ResetPassword() {
    const [email, setEmail] = useState("");
    const [messaggio, setMessaggio] = useState(null);
    const [errore, setErrore] = useState(null);
    const [caricamento, setCaricamento] = useState(false);
    const navigate = useNavigate();

    async function handleInvia() {
        if (!email.trim()) {
            setErrore("Inserisci la tua email");
            return;
        }
        setCaricamento(true);
        setErrore(null);
        try {
            await richiediResetPassword(email);
            setMessaggio("Richiesta inviata!");
        } catch {
            setErrore("Errore durante l'invio — riprova.");
        } finally {
            setCaricamento(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.titolo}>
                    Ajaks<span className={styles.titoloAccento}>Inventory</span>
                </div>
                <div className={styles.sottotitolo}>ITI E. Fermi — Modena</div>

                {!messaggio ? (
                    <>
                        <div className={styles.campo}>
                            <label className={styles.label}>Email istituzionale</label>
                            <input
                                className={styles.input}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="cognome.nome@fermi.mo.it"
                                onKeyDown={e => e.key === "Enter" && handleInvia()}
                                autoComplete="off"
                            />
                        </div>

                        {errore && <div className={styles.errore}>{errore}</div>}

                        <button
                            className={styles.bottone}
                            onClick={handleInvia}
                            disabled={caricamento}
                        >
                            {caricamento ? "Invio in corso..." : "Invia richiesta"}
                        </button>
                    </>
                ) : (
                    <div className={styles.successo}>{messaggio}</div>
                )}

                <button
                    className={styles.contattoAdmin}
                    onClick={() => navigate("/login")}
                >
                    Torna al login
                </button>
            </div>
        </div>
    );
}

export default ResetPassword;