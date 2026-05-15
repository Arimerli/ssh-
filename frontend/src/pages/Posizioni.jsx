import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getLocations,
  creaPosizione,
  eliminaPosizione,
  modificaPosizione
} from "../api/api";

import {
  LuHouse,
  LuContainer,
  LuArchive,
  LuTrash2,
  LuPencil,
  LuCheck,
  LuX
} from "react-icons/lu";

import styles from "./Posizioni.module.css";

function Posizioni({ utente }) {
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [labAperti, setLabAperti] = useState({});
  const [scaffaleAperti, setScaffaleAperti] = useState({});
  const [formAttivo, setFormAttivo] = useState(null);

  const [nomeLab, setNomeLab] = useState("");
  const [numScaffali, setNumScaffali] = useState(1);
  const [cassetti, setCassetti] = useState([1]);

  const [nomeScaffale, setNomeScaffale] = useState("");
  const [numCassetti, setNumCassetti] = useState(1);
  const [nomeCassetto, setNomeCassetto] = useState("");

  const [modificaId, setModificaId] = useState(null);
  const [nuovoNome, setNuovoNome] = useState("");

  const puoModificare = utente?.ruolo === "Amministratore" || utente?.ruolo === "Tecnico";

  useEffect(() => {
    caricaLocations();
  }, []);

  async function caricaLocations() {
    const res = await getLocations();
    setLocations(res.data);
  }

  function getFigli(parentId) {
    return locations.filter(l => l.parent === parentId);
  }

  const laboratori = locations.filter(l => l.parent === null);

  const toggleLab = (id) => setLabAperti(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleScaffale = (id) => setScaffaleAperti(prev => ({ ...prev, [id]: !prev[id] }));

  function aggiornaNumScaffali(n) {
    const num = parseInt(n) || 1;
    setNumScaffali(num);
    setCassetti(Array(num).fill(1));
  }

  function aggiornaCassetti(index, valore) {
    setCassetti(prev => prev.map((v, i) => (i === index ? parseInt(valore) || 1 : v)));
  }

  async function handleCreaLab() {
    if (!nomeLab.trim()) return;
    await creaPosizione({
      tipo: "laboratorio",
      nome: nomeLab,
      scaffali: cassetti.map(n => ({ num_cassetti: n }))
    });
    resetForm();
    caricaLocations();
  }

  async function handleCreaScaffale(labId) {
    if (!nomeScaffale.trim()) return;
    await creaPosizione({
      tipo: "scaffale",
      nome: nomeScaffale,
      parent_id: labId,
      num_cassetti: numCassetti
    });
    resetForm();
    caricaLocations();
  }

  async function handleCreaCassetto(scaffaleId) {
    if (!nomeCassetto.trim()) return;
    await creaPosizione({
      tipo: "cassetto",
      nome: nomeCassetto,
      parent_id: scaffaleId
    });
    resetForm();
    caricaLocations();
  }

  const resetForm = () => {
    setFormAttivo(null);
    setNomeLab("");
    setNomeScaffale("");
    setNomeCassetto("");
    setNumScaffali(1);
    setNumCassetti(1);
    setCassetti([1]);
  };

  async function handleElimina(e, id, nome) {
    e.stopPropagation();
    if (!window.confirm(`Eliminare "${nome}" e tutto il suo contenuto?`)) return;
    await eliminaPosizione(id);
    caricaLocations();
  }

  async function handleModifica(e, id) {
    e.stopPropagation();
    if (!nuovoNome.trim()) return;
    await modificaPosizione(id, nuovoNome);
    setModificaId(null);
    setNuovoNome("");
    caricaLocations();
  }

  function avviaModifica(e, id, nome) {
    e.stopPropagation();
    setModificaId(id);
    setNuovoNome(nome);
  }

  function annullaModifica(e) {
    e.stopPropagation();
    setModificaId(null);
    setNuovoNome("");
  }

  const ActionButtons = ({ id, nome, inModifica }) => {
    if (!puoModificare) return null;

    return (
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {inModifica ? (
          <>
            <span className={styles.btnConferma} onClick={(e) => handleModifica(e, id)}>
              <LuCheck size={18} />
            </span>
            <span className={styles.btnAnnullaModifica} onClick={annullaModifica}>
              <LuX size={18} />
            </span>
          </>
        ) : (
          <>
            <span className={styles.btnModifica} onClick={(e) => avviaModifica(e, id, nome)}>
              <LuPencil size={18} />
            </span>
            <span className={styles.btnElimina} onClick={(e) => handleElimina(e, id, nome)}>
              <LuTrash2 size={18} />
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.lista}>
        {laboratori.map((lab) => {
          const scaffali = getFigli(lab.id);
          const aperto = labAperti[lab.id];
          const inModificaLab = modificaId === lab.id;

          return (
            <div key={lab.id} className={styles.labCard}>
              <div className={styles.labHeader}>
                <div className={styles.labInfo} onClick={() => !inModificaLab && toggleLab(lab.id)}>
                  <div className={styles.labIcona}><LuHouse size={20} /></div>
                  <div>
                    <div className={styles.labSotto}>LABORATORIO</div>
                    {inModificaLab ? (
                      <input
                        className={styles.inputModifica}
                        value={nuovoNome}
                        onChange={(e) => setNuovoNome(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                    ) : (
                      <div className={styles.labNome}>{lab.nome}</div>
                    )}
                  </div>
                </div>

                <div className={styles.labRight}>
                  {!inModificaLab && (
                    <span className={styles.btnFiltro} onClick={() => navigate(`/componenti?posizione=${lab.id}`)}>
                      Vedi tutto →
                    </span>
                  )}
                  <ActionButtons id={lab.id} nome={lab.nome} inModifica={inModificaLab} />
                  <span className={styles.freccia} onClick={() => toggleLab(lab.id)}>
                    {aperto ? "▾" : "▸"}
                  </span>
                </div>
              </div>

              {aperto && (
                <div className={styles.labContenuto}>
                  {scaffali.map((scaffale) => {
                    const cassetti_list = getFigli(scaffale.id);
                    const scaffAperto = scaffaleAperti[scaffale.id];
                    const inModificaScaff = modificaId === scaffale.id;

                    return (
                      <div key={scaffale.id} className={styles.scaffaleCard}>
                        <div className={styles.scaffaleHeader}>
                          <div className={styles.scaffaleInfo} onClick={() => !inModificaScaff && toggleScaffale(scaffale.id)}>
                            <div className={styles.scaffaleIcona}><LuContainer size={18} /></div>
                            <div>
                              <div className={styles.scaffaleSotto}>SCAFFALE</div>
                              {inModificaScaff ? (
                                <input
                                  className={styles.inputModifica}
                                  value={nuovoNome}
                                  onChange={(e) => setNuovoNome(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  autoFocus
                                />
                              ) : (
                                <div className={styles.scaffaleNome}>{scaffale.nome}</div>
                              )}
                            </div>
                          </div>
                          <div className={styles.scaffaleRight}>
                            <ActionButtons id={scaffale.id} nome={scaffale.nome} inModifica={inModificaScaff} />
                            <span className={styles.freccia} onClick={() => toggleScaffale(scaffale.id)}>
                              {scaffAperto ? "▾" : "▸"}
                            </span>
                          </div>
                        </div>

                        {scaffAperto && (
                          <div className={styles.scaffaleContenuto}>
                            {cassetti_list.map((c) => {
                              const inModificaCass = modificaId === c.id;
                              return (
                                <div
                                  key={c.id}
                                  className={styles.cassettoRiga}
                                  onClick={() => !inModificaCass && navigate(`/componenti?posizione=${c.id}`)}
                                >
                                  <div className={styles.labInfo} style={{ flex: 1 }}>
                                    <LuArchive size={16} />
                                    {inModificaCass ? (
                                      <input
                                        className={styles.inputModifica}
                                        value={nuovoNome}
                                        onChange={(e) => setNuovoNome(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                      />
                                    ) : (
                                      <span className={styles.cassettoNome}>{c.nome}</span>
                                    )}
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <ActionButtons id={c.id} nome={c.nome} inModifica={inModificaCass} />
                                    {!inModificaCass && <span className={styles.cassettoArrow}>→</span>}
                                  </div>
                                </div>
                              );
                            })}

                            {puoModificare && formAttivo === `cassetto-${scaffale.id}` ? (
                              <div className={styles.formInline}>
                                <input
                                  className={styles.input}
                                  value={nomeCassetto}
                                  onChange={(e) => setNomeCassetto(e.target.value)}
                                  placeholder="Nome cassetto"
                                  autoFocus
                                />
                                <button className={styles.btnCrea} onClick={() => handleCreaCassetto(scaffale.id)}>
                                  Crea
                                </button>
                                <button className={styles.btnAnnulla} onClick={() => setFormAttivo(null)}>
                                  Annulla
                                </button>
                              </div>
                            ) : (
                              puoModificare && (
                                <div className={styles.aggiungiRiga} onClick={() => setFormAttivo(`cassetto-${scaffale.id}`)}>
                                  + Aggiungi cassetto
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {puoModificare && formAttivo === `scaffale-${lab.id}` ? (
                    <div className={styles.formScaffale}>
                      <div className={styles.formRiga}>
                        <label className={styles.label}>Nome scaffale</label>
                        <input
                          className={styles.input}
                          value={nomeScaffale}
                          onChange={(e) => setNomeScaffale(e.target.value)}
                          placeholder="es. Scaffale 3"
                          autoFocus
                        />
                      </div>
                      <div className={styles.formRiga}>
                        <label className={styles.label}>Numero cassetti</label>
                        <input
                          className={styles.inputNumero}
                          type="number"
                          min="1"
                          value={numCassetti}
                          onChange={(e) => setNumCassetti(parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className={styles.formBtns}>
                        <button className={styles.btnCrea} onClick={() => handleCreaScaffale(lab.id)}>
                          Crea
                        </button>
                        <button className={styles.btnAnnulla} onClick={() => setFormAttivo(null)}>
                          Annulla
                        </button>
                      </div>
                    </div>
                  ) : (
                    puoModificare && (
                      <div className={styles.aggiungiRiga} onClick={() => setFormAttivo(`scaffale-${lab.id}`)}>
                        + Aggiungi scaffale
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}

        {puoModificare && formAttivo === "laboratorio" ? (
          <div className={styles.formLab}>
            <div className={styles.formTitolo}>Nuovo laboratorio</div>
            <div className={styles.formRiga}>
              <label className={styles.label}>Nome laboratorio</label>
              <input
                className={styles.input}
                value={nomeLab}
                onChange={(e) => setNomeLab(e.target.value)}
                placeholder="es. Lab C"
                autoFocus
              />
            </div>
            <div className={styles.formRiga}>
              <label className={styles.label}>Quanti scaffali</label>
              <input
                className={styles.inputNumero}
                type="number"
                min="1"
                value={numScaffali}
                onChange={(e) => aggiornaNumScaffali(e.target.value)}
              />
            </div>
            {cassetti.map((n, i) => (
              <div key={i} className={styles.formRiga}>
                <label className={styles.label}>Scaffale {i + 1} — quanti cassetti</label>
                <input
                  className={styles.inputNumero}
                  type="number"
                  min="1"
                  value={n}
                  onChange={(e) => aggiornaCassetti(i, e.target.value)}
                />
              </div>
            ))}
            <div className={styles.formBtns}>
              <button className={styles.btnCrea} onClick={handleCreaLab}>
                Crea laboratorio
              </button>
              <button className={styles.btnAnnulla} onClick={() => setFormAttivo(null)}>
                Annulla
              </button>
            </div>
          </div>
        ) : (
          puoModificare && (
            <div className={styles.aggiungiLab} onClick={() => setFormAttivo("laboratorio")}>
              + Aggiungi laboratorio
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Posizioni;