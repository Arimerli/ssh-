import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sidebar, Topbar } from "./components";

import {
  Componenti,
  Login,
  AggiungiComponente,
  DettaglioComponente,
  ModificaComponente,
  Categorie,
  Impostazioni,
  Utenti,
  AggiungiUtente,
  ResetPassword,
  Posizioni,
  Esperienze,
  DettaglioEsperienza,
  AggiungiEsperienza,
  ModificaEsperienza,
  Acquisti,
} from "./pages";

import styles from "./App.module.css";
import { getUtenteCorrente } from "./api/api";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [utente, setUtente] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUtenteCorrente()
        .then((res) => setUtente(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
        })
        .finally(() => setCaricamento(false));
    } else {
      setCaricamento(false);
    }
  }, []);

  const handleRouteChange = () => setSidebarOpen(false);

  if (caricamento) return null;

  if (!utente) {
    return (
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
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleRouteChange}
        />
        <div className={styles.rightColumn}>
          <Topbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            utente={utente}
            setUtente={setUtente}
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
          />
          <div className={styles.mainContent}>
            <Routes>
              <Route
                path="/componenti"
                element={
                  <Componenti searchQuery={searchQuery} utente={utente} />
                }
              />
              <Route
                path="/componenti/aggiungi"
                element={<AggiungiComponente />}
              />
              <Route
                path="/componenti/:id"
                element={<DettaglioComponente utente={utente} />}
              />
              <Route
                path="/componenti/:id/modifica"
                element={<ModificaComponente />}
              />
              <Route
                path="/categorie"
                element={<Categorie utente={utente} />}
              />
              <Route
                path="/posizioni"
                element={<Posizioni utente={utente} />}
              />
              <Route
                path="/esperienze"
                element={
                  <Esperienze searchQuery={searchQuery} utente={utente} />
                }
              />
              <Route
                path="/esperienze/aggiungi"
                element={<AggiungiEsperienza />}
              />
              <Route
                path="/esperienze/:id"
                element={<DettaglioEsperienza utente={utente} />}
              />
              <Route
                path="/esperienze/:id/modifica"
                element={<ModificaEsperienza />}
              />
              <Route path="/acquisti" element={<Acquisti utente={utente} />} />
              <Route path="/utenti" element={<Utenti utente={utente} />} />
              <Route path="/utenti/aggiungi" element={<AggiungiUtente />} />
              <Route
                path="/impostazioni"
                element={<Impostazioni utente={utente} />}
              />
              <Route path="*" element={<Navigate to="/componenti" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
