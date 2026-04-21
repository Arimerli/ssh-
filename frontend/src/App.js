/* importa BrowserRouter e Routes da react-router-dom */
/* BrowserRouter gestisce la navigazione tra pagine */
/* Routes e Route definiscono quale componente mostrare per ogni indirizzo */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
/* importa i componenti nella pagina */
import Sidebar from "./components/Sidebar";
import Topbar from"./components/Topbar";
import Componenti from "./pages/Componenti";

/* importa il file CSS di questo componente */
import styles from "./App.module.css";

function App() {
  const [searchQuery, setSearchQuery ] = useState("");
  return (
    /* BrowserRouter avvolge tutta l'app per abilitare la navigazione */
    <BrowserRouter>

      {/* div esterno che mette sidebar e contenuto affiancati */}
      <div className={styles.appContainer}>

        {/* la sidebar appare su tutte le pagine */}
        <Sidebar />
        <div className={styles.rightColumn}>
            <Topbar
                setSearchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
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