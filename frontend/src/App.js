/* importa BrowserRouter e Routes da react-router-dom */
/* BrowserRouter gestisce la navigazione tra pagine */
/* Routes e Route definiscono quale componente mostrare per ogni indirizzo */
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useState, useEffect } from "react";
/* importa i componenti nella pagina */
import Sidebar from "./components/Sidebar";
import Topbar from"./components/Topbar";
import Componenti from "./pages/Componenti";
import Login from "./pages/Login";

/* importa il file CSS di questo componente */
import styles from "./App.module.css";
import { getUtenteCorrente } from "./api/api";

function App() {
    const [searchQuery, setSearchQuery ] = useState("");
    const [utente, setUtente] = useState(null);
    const [caricamento, setCaricamento] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // se c'è il token prende i dati dell'utente
            getUtenteCorrente()
                .then(res => setUtente(res.data)) //se l'utente è gia loggato si riaggiorna setUtente
                .catch(() => {
                    // se il token è scaduto lo rimuove
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh');
                })
                .finally(() => setCaricamento(false));
        } else {
            setCaricamento(false);
        }
    }, []);

    if (caricamento) return null;

    if(!utente) {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login setUtente={setUtente} /> } />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    )
    }
    return (
    /* BrowserRouter avvolge tutta l'app per abilitare la navigazione */
    <BrowserRouter>

      {/* div esterno che mette sidebar e contenuto affiancati */}
      <div className={styles.appContainer}>

        {/* la sidebar appare su tutte le pagine */}
        <Sidebar />
        <div className={styles.rightColumn}>
            <Topbar
                SearchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                utente={utente}
                setUtente={setUtente}
            />
            <div className={styles.mainContent}>

            {/* Routes decide quale pagina mostrare in base all'indirizzo */}
            <Routes>
                {/* per ora mostriamo solo testi segnaposto */}
                <Route path="/componenti" element={<Componenti searchQuery={searchQuery} />} />
                <Route path="/categorie" element={<h1>Pagina Categorie</h1>} />
                <Route path="/posizioni" element={<h1>Pagina Posizioni</h1>} />
                <Route path="/esperienze" element={<h1>Pagina Esperienze</h1>} />
                <Route path="/statistiche" element={<h1>Pagina Statistiche</h1>} />
                <Route path="/utenti" element={<h1>Pagina Utenti</h1>} />
              </Routes>
            </div>
        </div>
      </div>
    </BrowserRouter>
    );
}

export default App;