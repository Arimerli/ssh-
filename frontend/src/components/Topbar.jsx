import { FiSearch } from "react-icons/fi";
import { LuLogOut, LuMenu } from "react-icons/lu";
import styles from "./Topbar.module.css";
import ThemeToggle from "./ThemeToggle";
import { logoutUtente } from "../api/api";
import { useNavigate } from "react-router-dom";

function Topbar({
  searchQuery,
  setSearchQuery,
  utente,
  setUtente,
  onMenuClick,
}) {
  const navigate = useNavigate();

  const getInitials = (ruolo) => {
    if (!ruolo) return "?";
    return ruolo.slice(0, 2).toUpperCase();
  };

  const getAvatarClass = (ruolo) => {
    switch (ruolo) {
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
      /* continue even if backend fails */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    setUtente(null);
    navigate("/login");
  };

  return (
    <header className={styles.topbar}>
      {/* Hamburger — only visible on mobile */}
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Apri menu"
      >
        <LuMenu />
      </button>

      {/* Search box */}
      <div className={styles.searchBox}>
        <FiSearch className={styles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          placeholder="Cerca componenti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="Cerca"
        />
        {searchQuery && (
          <button
            className={styles.clearButton}
            onClick={() => setSearchQuery("")}
            aria-label="Cancella ricerca"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right section: theme toggle + user info */}
      <div className={styles.rightSection}>
        <ThemeToggle />

        <div className={styles.userArea}>
          <div
            className={`${styles.userAvatar} ${getAvatarClass(utente?.ruolo)}`}
          >
            {getInitials(utente?.ruolo)}
          </div>
          {/* Hide name/role on small screens to save space */}
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {utente?.nome} {utente?.cognome}
            </div>
            <div className={styles.userRole}>{utente?.ruolo}</div>
            <span className={styles.logoutLink} onClick={handleLogout}>
              <LuLogOut aria-hidden="true" /> Logout
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
