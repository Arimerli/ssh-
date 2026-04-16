import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

function Sidebar() {
    return(
        <div className={styles.sidebar}>

            <div className={styles.logoArea}>
                <div className={styles.logoTitle}>
                    <span>Ajaks</span>inventory
                </div>
                <div className={styles.logoSub}>ITIS E. Fermi - Modena</div>
            </div>

            <nav>
                <div className={styles.navGroup}>
                    <div className={styles.navGroupLabel}>Magazzino</div>
                    <NavLink to="/componenti" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Componenti</NavLink>
                    <NavLink to="/categorie" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Categorie</NavLink>
                    <NavLink to="/posizioni" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Posizioni</NavLink>
                </div>

                <div className={styles.navGroup}>
                    <div className={styles.navGroupLabel}>Attività</div>
                        <NavLink to="/esperienze" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Esperienze</NavLink>
                        <NavLink to="/statistiche" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Statistiche</NavLink>
                </div>

                <div className={styles.navGroup}>
                    <div className={styles.navGroupLabel}>Gestione</div>
                        <NavLink to="/utenti" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Utenti</NavLink>
                        <NavLink to="/impostazioni" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}>Impostazioni</NavLink>
                </div>
            </nav>
        </div>
    );
}

export default Sidebar;