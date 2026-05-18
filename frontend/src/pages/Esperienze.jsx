import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Esperienze.module.css";
import Fab from "../components/Fab";
import api from "../api/api";

function Esperienze({ searchQuery, utente }) {
  const [esperienze, setEsperienze] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/esperienze/").then((res) => setEsperienze(res.data));
  }, []);

  const esperienzeFiltrate = esperienze.filter((e) =>
    e.nome.toLowerCase().includes((searchQuery || "").toLowerCase()),
  );

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.griglia}>
          {esperienzeFiltrate.map((esperienza) => (
            <div
              key={esperienza.id}
              className={styles.card}
              onClick={() => navigate(`/esperienze/${esperienza.id}`)}
            >
              <div className={styles.nome}>{esperienza.nome}</div>
              {esperienza.descrizione && (
                <div className={styles.descrizione}>
                  {esperienza.descrizione}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Fab
        destination="/esperienze/aggiungi"
        utente={utente}
        ruoli={["Amministratore", "Tecnici", "Professori"]}
      />
    </div>
  );
}

export default Esperienze;
