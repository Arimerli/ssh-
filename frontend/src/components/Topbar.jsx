import { FiSearch } from "react-icons/fi";
import { useState } from "react"; //per la gestione dell'inserimento del testo
import styles from "./Topbar.module.css";
import { LuSearch, LuX } from "react-icons/lu";
import ThemeToggle from './ThemeToggle';

function Topbar() {

    /* searchQuery = testo nella barra
       setSearchQuery = per l'aggionamento una volta digitata la ricerca */
    const [searchQuery, setSearchQuery] = useState("");

    return(
        <div className={styles.topbar}>
            <div className={styles.searchBox}>
                <FiSearch className={styles.searchIcon} />
                {/* onChange = si attiva quando viene premuto un pulsante
                         (e) = evento: contiene tutte le informazioni su quello che è successo ( quale tasto è stato premuto)
                         e.target.value = testo attuale inserito
                         setSearchQuery = aggiorna searchQuery con il nuovo testo*/}
                <input
                    type="text"
                    placeholder="Cerca componenti, categorie, utenti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                {searchQuery && (
                    <button
                        className={styles.clearButton}
                        onClick={() => setSearchQuery("")}
                    >
                        ✕
                    </button>
                )}
            </div>
            <div className={styles.actions}>
                <ThemeToggle />
            </div>
        </div>
    );
}

export default Topbar;