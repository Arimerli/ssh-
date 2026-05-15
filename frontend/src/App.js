import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from"./components/Topbar";
import Componenti from "./pages/Componenti";
import Login from "./pages/Login";
import AggiungiComponente from "./pages/AggiungiComponente";
import DettaglioComponente from "./pages/DettaglioComponente";
import ModificaComponente from "./pages/ModificaComponente";
import Categorie from "./pages/Categorie";
import Impostazioni from "./pages/Impostazioni";
import Utenti from "./pages/Utenti";
import AggiungiUtente from "./pages/AggiungiUtente";
import ResetPassword from "./pages/ResetPassword";
import Esperienze from "./pages/Esperienze";
import DettaglioEsperienza from "./pages/DettaglioEsperienza";
import AggiungiEsperienza from "./pages/AggiungiEsperienza";
import ModificaEsperienza from "./pages/ModificaEsperienza";
import Posizioni from "./pages/Posizioni";
import Acquisti from "./pages/Acquisti";

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
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        );
    }

    return (
        <BrowserRouter>
            <div className={styles.appContainer}>
                <Sidebar utente={utente} />
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
                            <Route path="/categorie" element={<Categorie utente={utente} />} />
                            <Route path="/posizioni" element={<Posizioni utente={utente} />} />
                            <Route path="/esperienze" element={<Esperienze searchQuery={searchQuery} utente={utente} />} />
                            <Route path="/esperienze/aggiungi" element={<AggiungiEsperienza />} />
                            <Route path="/esperienze/:id" element={<DettaglioEsperienza utente={utente} />} />
                            <Route path="/esperienze/:id/modifica" element={<ModificaEsperienza />} />
                            <Route path="/acquisti" element={<Acquisti utente={utente} />} />
                            <Route path="/utenti" element={<Utenti utente={utente} />} />
                            <Route path="/utenti/aggiungi" element={<AggiungiUtente />} />
                            <Route path="/impostazioni" element={<Impostazioni utente={utente} />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;