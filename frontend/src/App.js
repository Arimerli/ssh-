import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from"./components/Topbar";
import Componenti from "./pages/Componenti";
import Login from "./pages/Login";
import AggiungiComponente from "./pages/AggiungiComponente";
import DettaglioComponente from "./pages/DettaglioComponente";
import ModificaComponente from "./pages/ModificaComponente";

import styles from "./App.module.css";
import { getUtenteCorrente } from "./api/api";

function App() {
    const [searchQuery, setSearchQuery ] = useState("");
    const [utente, setUtente] = useState(null);
    const [caricamento, setCaricamento] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getUtenteCorrente()
                .then(res => setUtente(res.data))
                .catch(() => {
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
                    <Route path="/login" element={<Login setUtente={setUtente} />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <div className={styles.appContainer}>
                <Sidebar />
                <div className={styles.rightColumn}>
                    <Topbar
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        utente={utente}
                        setUtente={setUtente}
                    />
                    <div className={styles.mainContent}>
                        <Routes>
                            <Route path="/componenti" element={<Componenti searchQuery={searchQuery} utente={utente} />} />
                            <Route path="/componenti/aggiungi" element={<AggiungiComponente />} />
                            <Route path="/componenti/:id" element={<DettaglioComponente utente={utente} />} />
                            <Route path="/componenti/:id/modifica" element={<ModificaComponente />} />
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