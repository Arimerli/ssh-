import { FiSearch } from "react-icons/fi";
import { useState } from "react"; //per la gestione dell'inserimento del testo
import styles from "./Topbar.module.css";
import { LuSearch, LuX } from "react-icons/lu";
import ThemeToggle from './ThemeToggle';
import { logoutUtente } from "../api/api";
import { useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";

function Topbar({ searchQuery, setSearchQuery, utente, setUtente}) {

    const navigate = useNavigate();

    const getInitials = (ruolo) => {
        if (!ruolo) return "?";
        return ruolo.slice(0,2).toUpperCase();
    };

    const getAvatarClass = (ruolo) => {
        switch(ruolo) {
            case "Amministratore":
                return styles.amministratore;
            case "Tecnici":
                return styles.tecnici;
            default:
                return styles.professori;
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUtente();
        } catch (e) {
            // anche se fallisce lato backend, continuiamo
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        setUtente(null);
        navigate("/login");
    };

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

            <div className={styles.rightSection}>
                <div className={styles.actions}>
                    <ThemeToggle />
                </div>

                <div className={styles.userArea}>
                    <div className={`${styles.userAvatar} ${getAvatarClass(utente?.ruolo)}`}>{getInitials(utente?.ruolo)}</div>
                    <div>
                        <div className={styles.userName}>{utente?.username}</div>
                        <div className={styles.userRole}>{utente?.ruolo}</div>
                        <span className={styles.logoutLink} onClick={handleLogout}>
                            <LuLogOut />
                            Logout
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Topbar;