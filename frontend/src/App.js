/* importa BrowserRouter e Routes da react-router-dom */
/* BrowserRouter gestisce la navigazione tra pagine */
/* Routes e Route definiscono quale componente mostrare per ogni indirizzo */
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* importa il componente Sidebar */
import Sidebar from "./components/Sidebar";

/* importa il file CSS di questo componente */
import styles from "./App.module.css";

function App() {
  return (
    /* BrowserRouter avvolge tutta l'app per abilitare la navigazione */
    <BrowserRouter>

      {/* div esterno che mette sidebar e contenuto affiancati */}
      <div className={styles.appContainer}>

        {/* la sidebar appare su tutte le pagine */}
        <Sidebar />

        {/* area del contenuto principale */}
        <div className={styles.mainContent}>

          {/* Routes decide quale pagina mostrare in base all'indirizzo */}
          <Routes>
            {/* per ora mostriamo solo testi segnaposto */}
            <Route path="/componenti" element={<h1>Pagina Componenti</h1>} />
            <Route path="/categorie" element={<h1>Pagina Categorie</h1>} />
            <Route path="/posizioni" element={<h1>Pagina Posizioni</h1>} />
            <Route path="/esperienze" element={<h1>Pagina Esperienze</h1>} />
            <Route path="/statistiche" element={<h1>Pagina Statistiche</h1>} />
            <Route path="/utenti" element={<h1>Pagina Utenti</h1>} />
          </Routes>

        </div>
      </div>

    </BrowserRouter>
  );
}

export default App;