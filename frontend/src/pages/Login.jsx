import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUtente } from "../api/api";
import styles from "./Login.module.css";

function Login({ setUtente }) {
    const [username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[errore, setErrore] = useState("");
    const navigate = useNavigate();

    async function handleLogin() {
        try {
            const res = await loginUtente(username, password); //chiama l'API di django salvata in api
            localStorage.setItem('token', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            const utenteRes = await getUtenteCorrente();
            setUtente(res.data);
            navigate("/componenti");
        } catch (err) {
            setErrore("Username o password errati!!!");
        }
    }
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.titolo}>
                    <span className={styles.titoloAccento}>Ajaks</span>inventory
                </div>
                <div className={styles.sottotitolo}>ITI E. Fermi — Modena</div>

                <div className={styles.campo}>
                    <label className={styles.label}>Username</label>
                    <input
                        className={styles.input}
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)} //aggiorna la variabile ad ogni tasto premuto
                        placeholder="Inserisci username"
                    />
                </div>

                <div className={styles.campo}>
                    <label className={styles.label}>Password</label>
                    <input
                        className={styles.input}
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)} //aggiorna la variabile ad ogni tasto premuto
                        placeholder="Inserisci password"
                        onKeyDown={e => e.key === "Enter" && handleLogin()} //se premo invio prova il login
                    />
                </div>
                {errore && <div className={styles.errore}>{errore}</div>}

                <button className={styles.bottone} onClick={handleLogin}>
                    Accedi
                </button>
            </div>
        </div>
    );
}
export default Login;