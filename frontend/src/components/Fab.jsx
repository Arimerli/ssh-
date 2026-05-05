import { useNavigate } from "react-router-dom";
import styles from "./Fab.module.css";

function Fab({ destination, utente, ruoli = ['Amministratore', 'Tecnico'], onClick}) {

    const navigate = useNavigate();

    // se l'utente non ha un ruolo autorizzato non mostra nulla
    if (!utente || !ruoli.includes(utente.ruolo)) return null;

    return (
        <button
            className={styles.fab}
            onClick={() => navigate(destination)}
            title="Aggiungi"
        >
            +
        </button>
    );
}

export default Fab;