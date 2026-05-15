import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorie, getComponenti, eliminaCategoria } from "../api/api";
import { LuCable, LuLayers, LuTag, LuTrash2, LuPencil, LuCheck, LuX } from "react-icons/lu";
import api from "../api/api";
import styles from "./Categorie.module.css";

function Categorie({ utente }) {
  const [categorie, setCategorie] = useState([]);
  const [componenti, setComponenti] = useState([]);
  const [aperti, setAperti] = useState({});
  const [modificaId, setModificaId] = useState(null);
  const [nuovoNome, setNuovoNome] = useState("");
  const navigate = useNavigate();

  const puoModificare = utente?.ruolo === 'Amministratore' || utente?.ruolo === 'Tecnico';

  useEffect(() => {
    getCategorie().then(res => setCategorie(res.data));
    getComponenti().then(res => setComponenti(res.data));
  }, []);

  function toggleAperto(e, id) {
    e.stopPropagation();
    setAperti(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function getTutteLeCategorie(id) {
    const risultato = [id];
    const figli = categorie.filter(c => c.parent === id);
    figli.forEach(f => risultato.push(...getTutteLeCategorie(f.id)));
    return risultato;
  }

  function contaComponenti(id) {
    const tutteCategorie = getTutteLeCategorie(id);
    return componenti.filter(c => tutteCategorie.includes(c.categoria)).length;
  }

  function getSottoCategorie(id) {
    return categorie.filter(c => c.parent === id);
  }

  function puoEliminare(id) {
    return contaComponenti(id) === 0;
  }

  async function handleElimina(e, id, nome) {
    e.stopPropagation();
    if (!window.confirm(`Eliminare "${nome}" e tutte le sue sottocategorie?`)) return;
    await eliminaCategoria(id);
    getCategorie().then(res => setCategorie(res.data));
    getComponenti().then(res => setComponenti(res.data));
  }

  async function handleModifica(e, id) {
    e.stopPropagation();
    if (!nuovoNome.trim()) return;
    await api.patch(`/categorie/${id}/modifica/`, { nome: nuovoNome });
    setModificaId(null);
    setNuovoNome("");
    getCategorie().then(res => setCategorie(res.data));
  }

  function avviaModifica(e, id, nomeAttuale) {
    e.stopPropagation();
    setModificaId(id);
    setNuovoNome(nomeAttuale);
  }

  function annullaModifica(e) {
    e.stopPropagation();
    setModificaId(null);
    setNuovoNome("");
  }

  const coloriAccent = [
    "rgba(55, 138, 221, 0.20)",
    "rgba(24, 95, 165, 0.20)",
    "rgba(96, 165, 250, 0.20)",
    "rgba(12, 68, 124, 0.20)",
    "rgba(147, 197, 253, 0.20)",
  ];

  const coloriTesto = [
    "#378ADD",
    "#60a5fa",
    "#93c5fd",
    "#378ADD",
    "#60a5fa",
  ];

  function getIcona(livello) {
    if (livello === 0) return <LuCable size={16} />;
    if (livello === 1) return <LuLayers size={14} />;
    return <LuTag size={13} />;
  }

  function getLivelloLabel(livello) {
    if (livello === 0) return "CATEGORIA";
    if (livello === 1) return "SOTTOCATEGORIA";
    return "TIPO";
  }

  function Nodo({ id, livello }) {
    const cat = categorie.find(c => c.id === id);
    if (!cat) return null;

    const aperto = aperti[id];
    const figli = getSottoCategorie(id);
    const haFigli = figli.length > 0;
    const colore = coloriAccent[livello % coloriAccent.length];
    const coloreTesto = coloriTesto[livello % coloriTesto.length];
    const inModifica = modificaId === id;

    return (
      <div className={styles.card}>
        <div
          className={styles.header}
          onClick={() => !inModifica && navigate(`/componenti?categoria=${id}`)}
        >
          <div className={styles.info}>
            <div className={styles.icona} style={{ background: colore, color: coloreTesto }}>
              {getIcona(livello)}
            </div>
            <div>
              <div className={styles.sotto}>{getLivelloLabel(livello)}</div>
              {inModifica ? (
                <input
                  className={styles.inputModifica}
                  value={nuovoNome}
                  onChange={e => setNuovoNome(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <div className={styles.nome} style={{ color: coloreTesto }}>{cat.nome}</div>
              )}
            </div>
          </div>

          <div className={styles.right}>
            {!inModifica && !aperto && haFigli && (
              <div className={styles.sottonomi}>
                {figli.map(f => f.nome).join(" · ")}
              </div>
            )}

            {!inModifica && (
              <span className={styles.badge}>
                {contaComponenti(id)} componenti
              </span>
            )}

            {puoModificare && inModifica && (
              <>
                <span className={styles.btnConferma} onClick={e => handleModifica(e, id)}>
                  <LuCheck size={14} />
                </span>
                <span className={styles.btnAnnullaModifica} onClick={annullaModifica}>
                  <LuX size={14} />
                </span>
              </>
            )}

            {puoModificare && !inModifica && (
              <>
                <span
                  className={styles.btnModifica}
                  onClick={e => avviaModifica(e, id, cat.nome)}
                  title="Modifica nome"
                >
                  <LuPencil size={14} />
                </span>
                {puoEliminare(id) && (
                  <span
                    className={styles.btnElimina}
                    onClick={e => handleElimina(e, id, cat.nome)}
                    title="Elimina"
                  >
                    <LuTrash2 size={14} />
                  </span>
                )}
              </>
            )}

            {haFigli && !inModifica && (
              <span className={styles.freccia} onClick={e => toggleAperto(e, id)}>
                {aperto ? "▾" : "▸"}
              </span>
            )}
          </div>
        </div>

        {aperto && haFigli && (
          <div className={styles.sottoLista}>
            {figli.map(figlio => (
              <Nodo key={figlio.id} id={figlio.id} livello={livello + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const categorieMadre = categorie.filter(c => c.parent === null);

  return (
    <div className={styles.container}>
      <div className={styles.lista}>
        {categorieMadre.map(cat => (
          <Nodo key={cat.id} id={cat.id} livello={0} />
        ))}
      </div>
    </div>
  );
}

export default Categorie;