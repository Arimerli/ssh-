import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLocations, creaPosizione } from "../api/api";
import { LuHouse, LuContainer, LuArchive } from "react-icons/lu";
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

    const puoModificare = utente?.ruolo === 'Amministratore' || utente?.ruolo === 'Tecnico';

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

    function aggiornaNumScaffali(n) {
        const num = parseInt(n) || 1;
        setNumScaffali(num);
        setCassetti(Array(num).fill(1));
    }

    function aggiornaCassetti(index, valore) {
        setCassetti(prev => prev.map((v, i) => i === index ? parseInt(valore) || 1 : v));
    }

    async function handleCreaLab() {
        if (!nomeLab.trim()) return;
        await creaPosizione({
            tipo: 'laboratorio',
            nome: nomeLab,
            scaffali: cassetti.map(n => ({ num_cassetti: n })),
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
            tipo: 'scaffale',
            nome: nomeScaffale,
            parent_id: labId,
            num_cassetti: numCassetti,
        });
        setNomeScaffale("");
        setNumCassetti(1);
        setFormAttivo(null);
        caricaLocations();
    }

    async function handleCreaCassetto(scaffaleId) {
        if (!nomeCassetto.trim()) return;
        await creaPosizione({
            tipo: 'cassetto',
            nome: nomeCassetto,
            parent_id: scaffaleId,
        });
        setNomeCassetto("");
        setFormAttivo(null);
        caricaLocations();
    }

    return (
        <div className={styles.container}>
            <div className={styles.lista}>
                {laboratori.map(lab => {
                    const scaffali = getFigli(lab.id);
                    const aperto = labAperti[lab.id];

                    return (
                        <div key={lab.id} className={styles.labCard}>
                            <div className={styles.labHeader}>
                                <div
                                    className={styles.labInfo}
                                    onClick={() => toggleLab(lab.id)}
                                >
                                    <div className={styles.labIcona}>
                                        <LuHouse size={16} />
                                    </div>
                                    <div>
                                        <div className={styles.labSotto}>LABORATORIO</div>
                                        <div className={styles.labNome}>{lab.nome}</div>
                                    </div>
                                </div>
                                <div className={styles.labRight}>
                                    <span
                                        className={styles.btnFiltro}
                                        onClick={() => navigate(`/componenti?posizione=${lab.id}`)}
                                        title="Vedi componenti"
                                    >
                                        Vedi componenti →
                                    </span>
                                    <span
                                        className={styles.freccia}
                                        onClick={() => toggleLab(lab.id)}
                                    >
                                        {aperto ? "▾" : "▸"}
                                    </span>
                                </div>
                            </div>

                            {aperto && (
                                <div className={styles.labContenuto}>
                                    {scaffali.map(scaffale => {
                                        const cassetti_list = getFigli(scaffale.id);
                                        const scaffAperto = scaffaleAperti[scaffale.id];

                                        return (
                                            <div key={scaffale.id} className={styles.scaffaleCard}>
                                                <div className={styles.scaffaleHeader}>
                                                    <div
                                                        className={styles.scaffaleInfo}
                                                        onClick={() => toggleScaffale(scaffale.id)}
                                                    >
                                                        <div className={styles.scaffaleIcona}>
                                                            <LuContainer size={14} />
                                                        </div>
                                                        <div>
                                                            <div className={styles.scaffaleSotto}>SCAFFALE</div>
                                                            <div className={styles.scaffaleNome}>{scaffale.nome}</div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.scaffaleRight}>
                                                        <span
                                                            className={styles.btnFiltro}
                                                            onClick={() => navigate(`/componenti?posizione=${scaffale.id}`)}
                                                            title="Vedi componenti"
                                                        >
                                                            Vedi componenti →
                                                        </span>
                                                        <span
                                                            className={styles.freccia}
                                                            onClick={() => toggleScaffale(scaffale.id)}
                                                        >
                                                            {scaffAperto ? "▾" : "▸"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {scaffAperto && (
                                                    <div className={styles.scaffaleContenuto}>
                                                        {cassetti_list.map(cassetto => (
                                                            <div
                                                                key={cassetto.id}
                                                                className={styles.cassettoRiga}
                                                                onClick={() => navigate(`/componenti?posizione=${cassetto.id}`)}
                                                            >
                                                                <div className={styles.cassettoIcona}>
                                                                    <LuArchive size={13} />
                                                                </div>
                                                                <span className={styles.cassettoNome}>{cassetto.nome}</span>
                                                                <span className={styles.cassettoArrow}>→</span>
                                                            </div>
                                                        ))}

                                                        {puoModificare && formAttivo === `cassetto-${scaffale.id}` ? (
                                                            <div className={styles.formInline}>
                                                                <input
                                                                    className={styles.input}
                                                                    value={nomeCassetto}
                                                                    onChange={e => setNomeCassetto(e.target.value)}
                                                                    placeholder="Nome cassetto"
                                                                    autoFocus
                                                                />
                                                                <button className={styles.btnCrea} onClick={() => handleCreaCassetto(scaffale.id)}>Crea</button>
                                                                <button className={styles.btnAnnulla} onClick={() => setFormAttivo(null)}>Annulla</button>
                                                            </div>
                                                        ) : puoModificare && (
                                                            <div className={styles.aggiungiRiga} onClick={() => setFormAttivo(`cassetto-${scaffale.id}`)}>
                                                                <span>+</span>
                                                                <span>Aggiungi cassetto</span>
                                                            </div>
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
                                                    onChange={e => setNomeScaffale(e.target.value)}
                                                    placeholder="es. Scaffale 3"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className={styles.formRiga}>
                                                <label className={styles.label}>Quanti cassetti</label>
                                                <input
                                                    className={styles.inputNumero}
                                                    type="number"
                                                    min="1"
                                                    value={numCassetti}
                                                    onChange={e => setNumCassetti(parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div className={styles.formBtns}>
                                                <button className={styles.btnCrea} onClick={() => handleCreaScaffale(lab.id)}>Crea</button>
                                                <button className={styles.btnAnnulla} onClick={() => setFormAttivo(null)}>Annulla</button>
                                            </div>
                                        </div>
                                    ) : puoModificare && (
                                        <div className={styles.aggiungiRiga} onClick={() => setFormAttivo(`scaffale-${lab.id}`)}>
                                            <span>+</span>
                                            <span>Aggiungi scaffale</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {puoModificare && formAttivo === 'laboratorio' ? (
                    <div className={styles.formLab}>
                        <div className={styles.formTitolo}>Nuovo laboratorio</div>
                        <div className={styles.formRiga}>
                            <label className={styles.label}>Nome laboratorio</label>
                            <input
                                className={styles.input}
                                value={nomeLab}
                                onChange={e => setNomeLab(e.target.value)}
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
                                onChange={e => aggiornaNumScaffali(e.target.value)}
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
                                    onChange={e => aggiornaCassetti(i, e.target.value)}
                                />
                            </div>
                        ))}
                        <div className={styles.formBtns}>
                            <button className={styles.btnCrea} onClick={handleCreaLab}>Crea</button>
                            <button className={styles.btnAnnulla} onClick={() => setFormAttivo(null)}>Annulla</button>
                        </div>
                    </div>
                ) : puoModificare && (
                    <div className={styles.aggiungiLab} onClick={() => setFormAttivo('laboratorio')}>
                        <span>+</span>
                        <span>Aggiungi laboratorio</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Posizioni;