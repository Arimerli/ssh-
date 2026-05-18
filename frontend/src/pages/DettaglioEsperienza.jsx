import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DettaglioEsperienza.module.css";
import api from "../api/api";
import { getComponenti } from "../api/api";

function DettaglioEsperienza({ utente }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [esperienza, setEsperienza] = useState(null);
  const [esperienzaComponents, setEsperienzaComponents] = useState([]);
  const [componenti, setComponenti] = useState([]);
  const [confermaElimina, setConfermaElimina] = useState(false);

  useEffect(() => {
    api.get(`/esperienze/${id}/`).then((res) => setEsperienza(res.data));
    api
      .get(`/esperienze-components/?esperienza=${id}`)
      .then((res) => setEsperienzaComponents(res.data));
    getComponenti().then((res) => setComponenti(res.data));
  }, [id]);

  async function elimina() {
    // elimina prima i collegamenti componenti
    for (const ec of esperienzaComponents) {
      await api.delete(`/esperienze-components/${ec.id}/`);
    }
    await api.delete(`/esperienze/${id}/`);
    navigate("/esperienze");
  }

  if (!esperienza) return null;

  return (
    <div className={styles.container}>
      {/* header con torna indietro e titolo */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate("/esperienze")}>
          ← Torna indietro
        </button>
        <h1 className={styles.titolo}>
          <span className={styles.titoloAccento}>Dettaglio </span>
          esperienza
        </h1>
      </div>

      {/* dati principali */}
      <div className={styles.sezione}>
        <div className={styles.sezioneLabel}>Informazioni</div>
        <div className={styles.nome}>{esperienza.nome}</div>
        {esperienza.descrizione && (
          <div className={styles.descrizione}>{esperienza.descrizione}</div>
        )}
      </div>

      {/* componenti usati */}
      <div className={styles.sezione}>
        <div className={styles.sezioneLabel}>Componenti utilizzati</div>
        {esperienzaComponents.length === 0 ? (
          <div className={styles.vuoto}>Nessun componente collegato</div>
        ) : (
          <div className={styles.listaComponenti}>
            {esperienzaComponents.map((ec) => {
              const comp = componenti.find((c) => c.id === ec.component);
              return comp ? (
                <div
                  key={ec.id}
                  className={styles.componenteRiga}
                  onClick={() => navigate(`/componenti/${comp.id}`)}
                >
                  <span className={styles.componenteNome}>{comp.nome}</span>
                  <span className={styles.componenteArrow}>→</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* azioni */}
      {(utente?.ruolo === "Amministratore" || utente?.ruolo === "Tecnico") && (
        <div className={styles.azioni}>
          <button
            className={styles.btnModifica}
            onClick={() => navigate(`/esperienze/${id}/modifica`)}
          >
            Modifica
          </button>
          {!confermaElimina ? (
            <button
              className={styles.btnElimina}
              onClick={() => setConfermaElimina(true)}
            >
              Elimina
            </button>
          ) : (
            <div className={styles.conferma}>
              <span className={styles.confermaTestp}>Sei sicuro?</span>
              <button className={styles.btnConfermaElimina} onClick={elimina}>
                Sì, elimina
              </button>
              <button
                className={styles.btnAnnulla}
                onClick={() => setConfermaElimina(false)}
              >
                Annulla
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DettaglioEsperienza;
