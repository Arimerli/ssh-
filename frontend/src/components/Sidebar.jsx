import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";

import styles from "./Sidebar.module.css";
function Sidebar({ isOpen, onClose, onNavigate, utente }) {
  const sidebarRef = useRef(null);

  const handleNav = () => {
    onNavigate?.();
    onClose?.();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // only on mobile
      if (window.innerWidth > 768) return;

      // only if sidebar open
      if (!isOpen) return;

      // click outside sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
    >
      <div className={styles.logoArea}>
        <div className={styles.logoTitle}>
          <span>Ajaks</span>inventory
        </div>
        <div className={styles.logoSub}>ITIS E. Fermi - Modena</div>
      </div>

      <nav>
        <div className={styles.navGroup}>
          <div className={styles.navGroupLabel}>Magazzino</div>
          <NavLink
            to="/componenti"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Componenti
          </NavLink>
          <NavLink
            to="/categorie"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Categorie
          </NavLink>
          <NavLink
            to="/posizioni"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Posizioni
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupLabel}>Attività</div>
          <NavLink
            to="/esperienze"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Esperienze
          </NavLink>

          <NavLink
            to="/acquisti"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Lista Acquisti
          </NavLink>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupLabel}>Gestione</div>
          <NavLink
            to="/utenti"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Utenti
          </NavLink>
          <NavLink
            to="/impostazioni"
            onClick={handleNav}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
          >
            Impostazioni
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;
