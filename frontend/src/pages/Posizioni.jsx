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

    const puoModificare =
        utente?.ruolo === "Amministratore" || utente?.ruolo === "Tecnico";

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

    function toggleLab(id) {
        setLabAperti(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function toggleScaffale(id) {
        setScaffaleAperti(prev => ({ ...prev, [id]: !prev[id] }));
    }

    // =========================
    // CREAZIONE POSIZIONI
    // =========================

    async function handleCreaLab() {
        if (!nomeLab.trim()) return;

        await creaPosizione({
            tipo: "laboratorio",
            nome: nomeLab,
            scaffali: cassetti.map(n => ({
                num_cassetti: n
            }))
        });

        setNomeLab("");
        setNumScaffali(1);
        setCassetti([1]);
        setFormAttivo(null);
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

        setNomeScaffale("");
        setNumCassetti(1);
        setFormAttivo(null);
        caricaLocations();
    }

    async function handleCreaCassetto(scaffaleId) {
        if (!nomeCassetto.trim()) return;

        await creaPosizione({
            tipo: "cassetto",
            nome: nomeCassetto,
            parent_id: scaffaleId
        });

        setNomeCassetto("");
        setFormAttivo(null);
        caricaLocations();
    }

    // =========================
    // MODIFICA / ELIMINA
    // =========================

    async function handleEliminaPosizione(e, id, nome) {
        e.stopPropagation();

        if (!window.confirm(`Eliminare "${nome}"?`)) return;

        await eliminaPosizione(id);
        caricaLocations();
    }

    async function handleModificaPosizione(e, id) {
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

    // =========================
    // RENDER
    // =========================

    return (
        <div className={styles.container}>
            <div className={styles.lista}>

                {/* ================= LABORATORI ================= */}
                {laboratori.map(lab => {
                    const scaffali = getFigli(lab.id);
                    const aperto = labAperti[lab.id];
                    const inModifica = modificaId === lab.id;

                    return (
                        <div key={lab.id} className={styles.labCard}>
                            <div className={styles.labHeader}>

                                <div
                                    className={styles.labInfo}
                                    onClick={() =>
                                        !inModifica && toggleLab(lab.id)
                                    }
                                >
                                    <div className={styles.labIcona}>
                                        <LuHouse size={16} />
                                    </div>

                                    <div>
                                        <div className={styles.labSotto}>
                                            LABORATORIO
                                        </div>

                                        {inModifica ? (
                                            <input
                                                className={styles.inputModifica}
                                                value={nuovoNome}
                                                onChange={e =>
                                                    setNuovoNome(e.target.value)
                                                }
                                                autoFocus
                                            />
                                        ) : (
                                            <div className={styles.labNome}>
                                                {lab.nome}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.labRight}>

                                    {puoModificare && inModifica ? (
                                        <>
                                            <span
                                                className={styles.btnConferma}
                                                onClick={e =>
                                                    handleModificaPosizione(
                                                        e,
                                                        lab.id
                                                    )
                                                }
                                            >
                                                <LuCheck size={14} />
                                            </span>

                                            <span
                                                className={styles.btnAnnullaModifica}
                                                onClick={annullaModifica}
                                            >
                                                <LuX size={14} />
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span
                                                className={styles.btnModifica}
                                                onClick={e =>
                                                    avviaModifica(
                                                        e,
                                                        lab.id,
                                                        lab.nome
                                                    )
                                                }
                                            >
                                                <LuPencil size={14} />
                                            </span>

                                            <span
                                                className={styles.btnElimina}
                                                onClick={e =>
                                                    handleEliminaPosizione(
                                                        e,
                                                        lab.id,
                                                        lab.nome
                                                    )
                                                }
                                            >
                                                <LuTrash2 size={14} />
                                            </span>
                                        </>
                                    )}

                                    <span
                                        className={styles.freccia}
                                        onClick={() => toggleLab(lab.id)}
                                    >
                                        {aperto ? "▾" : "▸"}
                                    </span>
                                </div>
                            </div>

                            {/* ================= SCAFFALI ================= */}
                            {aperto && (
                                <div className={styles.labContenuto}>

                                    {scaffali.map(scaffale => {
                                        const cassetti_list = getFigli(scaffale.id);
                                        const scaffAperto = scaffaleAperti[scaffale.id];

                                        return (
                                            <div
                                                key={scaffale.id}
                                                className={styles.scaffaleCard}
                                            >
                                                <div className={styles.scaffaleHeader}>

                                                    <div
                                                        className={styles.scaffaleInfo}
                                                        onClick={() =>
                                                            toggleScaffale(scaffale.id)
                                                        }
                                                    >
                                                        <div className={styles.scaffaleIcona}>
                                                            <LuContainer size={14} />
                                                        </div>

                                                        <div>
                                                            <div className={styles.scaffaleSotto}>
                                                                SCAFFALE
                                                            </div>

                                                            <div className={styles.scaffaleNome}>
                                                                {scaffale.nome}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={styles.freccia}
                                                    >
                                                        {scaffAperto ? "▾" : "▸"}
                                                    </span>
                                                </div>

                                                {/* ================= CASSETTI ================= */}
                                                {scaffAperto && (
                                                    <div className={styles.scaffaleContenuto}>

                                                        {cassetti_list.map(c => (
                                                            <div
                                                                key={c.id}
                                                                className={styles.cassettoRiga}
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/componenti?posizione=${c.id}`
                                                                    )
                                                                }
                                                            >
                                                                <LuArchive size={13} />
                                                                <span>{c.nome}</span>
                                                            </div>
                                                        ))}

                                                        {puoModificare && formAttivo === `cassetto-${scaffale.id}` ? (
                                                            <div className={styles.formInline}>
                                                                <input
                                                                    className={styles.input}
                                                                    value={nomeCassetto}
                                                                    onChange={e =>
                                                                        setNomeCassetto(e.target.value)
                                                                    }
                                                                />
                                                                <button onClick={() => handleCreaCassetto(scaffale.id)}>
                                                                    Crea
                                                                </button>
                                                            </div>
                                                        ) : puoModificare && (
                                                            <div
                                                                className={styles.aggiungiRiga}
                                                                onClick={() =>
                                                                    setFormAttivo(`cassetto-${scaffale.id}`)
                                                                }
                                                            >
                                                                + Aggiungi cassetto
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* ================= AGGIUNGI SCAFFALE ================= */}
                                    {puoModificare && formAttivo === `scaffale-${lab.id}` ? (
                                        <div className={styles.formInline}>
                                            <input
                                                value={nomeScaffale}
                                                onChange={e =>
                                                    setNomeScaffale(e.target.value)
                                                }
                                                placeholder="Nome scaffale"
                                            />
                                            <button onClick={() => handleCreaScaffale(lab.id)}>
                                                Crea
                                            </button>
                                        </div>
                                    ) : puoModificare && (
                                        <div
                                            className={styles.aggiungiRiga}
                                            onClick={() =>
                                                setFormAttivo(`scaffale-${lab.id}`)
                                            }
                                        >
                                            + Aggiungi scaffale
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ================= AGGIUNGI LAB ================= */}
                {puoModificare && formAttivo === "laboratorio" ? (
                    <div className={styles.formLab}>
                        <input
                            value={nomeLab}
                            onChange={e => setNomeLab(e.target.value)}
                            placeholder="Nome laboratorio"
                        />

                        <button onClick={handleCreaLab}>
                            Crea laboratorio
                        </button>
                    </div>
                ) : puoModificare && (
                    <div
                        className={styles.aggiungiLab}
                        onClick={() => setFormAttivo("laboratorio")}
                    >
                        + Aggiungi laboratorio
                    </div>
                )}
            </div>
        </div>
    );
}

export default Posizioni;