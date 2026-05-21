import { useState, useEffect } from "react";
import { getComponenti, getCategorie, getTagComponents, getTags, getLocations, getGiacenze } from "../api/api";
import styles from "./Componenti.module.css";
import ComponenteCard from "../components/ComponenteCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import Fab from "../components/Fab";
import api from "../api/api";

function Componenti({ searchQuery, utente }) {
    const [componenti, setComponenti] = useState([]);
    const [categorie, setCategorie] = useState([]);
    const [tagComponents, setTagComponents] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [locations, setLocations] = useState([]);
    const [giacenze, setGiacenze] = useState([]);
    // coda dei componenti sotto soglia da processare
    const [coda, setCoda] = useState([]);
    // indice corrente nella coda
    const [indiceCoda, setIndiceCoda] = useState(0);
    // quantità inserita nel popup
    const [quantitaPopup, setQuantitaPopup] = useState("");
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const categoriaFiltro = searchParams.get("categoria");
    const posizioneFiltro = searchParams.get("posizione");

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
            ? prev.filter(id => id !== tagId)
            : [...prev, tagId]
        );
    };

    function getTutteLeCategorie(categoriaId, tutteCategorie) {
        const risultato = [parseInt(categoriaId)];
        const figli = tutteCategorie.filter(c => c.parent === parseInt(categoriaId));
        figli.forEach(figlio => {
            risultato.push(...getTutteLeCategorie(figlio.id, tutteCategorie));
        });
        return risultato;
    }

    function getTutteLePosizioni(posizioneId, tutteLocations) {
        const risultato = [parseInt(posizioneId)];
        const figli = tutteLocations.filter(l => l.parent === parseInt(posizioneId));
        figli.forEach(figlio => {
            risultato.push(...getTutteLePosizioni(figlio.id, tutteLocations));
        });
        return risultato;
    }

    const componentiFiltrati = componenti
        .filter(c =>
            c.nome.toLowerCase().includes((searchQuery || "").toLowerCase())
        )
        .filter(c => {
            if (!categoriaFiltro) return true;
            const categorieValide = getTutteLeCategorie(categoriaFiltro, categorie);
            return categorieValide.includes(c.categoria);
        })
        .filter(c => {
            if (!posizioneFiltro) return true;
            const posizioniValide = getTutteLePosizioni(posizioneFiltro, locations);
            const giacenzeComponente = giacenze
                .filter(g => g.componente === c.id)
                .map(g => g.cassetto);
            return giacenzeComponente.some(cassetto => posizioniValide.includes(cassetto));
        })
        .filter(c => {
            if (selectedTags.length === 0) return true;
            const componentTagIds = tagComponents
                .filter(tc => tc.component === c.id)
                .map(tc => tc.tag);
            return selectedTags.every(tagId => componentTagIds.includes(tagId));
        });

    useEffect(() => {
        Promise.all([
            getComponenti(),
            getCategorie(),
            getTagComponents(),
            getTags(),
            getLocations(),
            getGiacenze(),
            api.get("/acquisti/"),
        ]).then(([compRes, catRes, tcRes, tagRes, locRes, giacRes, acquRes]) => {
            setComponenti(compRes.data);
            setCategorie(catRes.data);
            setTagComponents(tcRes.data);
            setTags(tagRes.data);
            setLocations(locRes.data);
            setGiacenze(giacRes.data);

            const giacenze = giacRes.data;
            const acquisti = acquRes.data;
            const componenti = compRes.data;

            const idGiaInLista = acquisti.map(a => a.componente);
            const daAggiungere = [];

            giacenze.forEach(g => {
                if (g.quantita <= g.min_quantita && !idGiaInLista.includes(g.componente)) {
                    const comp = componenti.find(c => c.id === g.componente);
                    if (comp && !daAggiungere.find(d => d.id === comp.id)) {
                        daAggiungere.push(comp);
                    }
                }
            });

            if (daAggiungere.length > 0) {
                setCoda(daAggiungere);
                setIndiceCoda(0);
                setQuantitaPopup("");
            }
        });
    }, []);

    // componente corrente nel popup
    const compCorrente = coda.length > 0 && indiceCoda < coda.length ? coda[indiceCoda] : null;

    async function aggiungiAllaLista() {
        if (!quantitaPopup || parseInt(quantitaPopup) <= 0) return;
        await api.post("/acquisti/", {
            componente: compCorrente.id,
            quantita: parseInt(quantitaPopup),
        });
        const prossimo = indiceCoda + 1;
        if (prossimo < coda.length) {
            setIndiceCoda(prossimo);
            setQuantitaPopup("");
        } else {
            setCoda([]);
        }
    }

    return (
        <div>
            {/* popup componente sotto soglia */}
            {compCorrente && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{
                        background: "var(--bg-sidebar)", border: "1px solid var(--border-color)",
                        borderRadius: 16, padding: 28, maxWidth: 420, width: "90%",
                    }}>
                        <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: "var(--text-primary)" }}>
                            <span style={{ color: "var(--accent)" }}>{compCorrente.nome}</span> è sotto la quantità minima
                        </div>
                        {coda.length > 1 && (
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                                {indiceCoda + 1} di {coda.length}
                            </div>
                        )}
                        <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                            Quanti pezzi vuoi aggiungere alla lista acquisti?
                        </div>
                        <input
                            type="number"
                            value={quantitaPopup}
                            onChange={e => setQuantitaPopup(e.target.value)}
                            placeholder="es. 50"
                            style={{
                                width: "100%", height: 38, border: "1px solid var(--border-color)",
                                borderRadius: 8, padding: "0 12px", fontSize: 14,
                                background: "var(--bg-input)", color: "var(--text-primary)",
                                marginBottom: 16, boxSizing: "border-box"
                            }}
                            autoFocus
                        />
                        <button
                            onClick={aggiungiAllaLista}
                            disabled={!quantitaPopup || parseInt(quantitaPopup) <= 0}
                            style={{
                                width: "100%", height: 38, background: "var(--accent)",
                                color: "#fff", border: "none", borderRadius: 8,
                                fontSize: 13, fontWeight: 500, cursor: "pointer",
                                opacity: (!quantitaPopup || parseInt(quantitaPopup) <= 0) ? 0.5 : 1
                            }}
                        >
                            {indiceCoda + 1 < coda.length ? "Aggiungi e continua" : "Aggiungi alla lista"}
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.tagBar}>
                {tags.map(tag => (
                    <span
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`${styles.tagItem} ${
                            selectedTags.includes(tag.id) ? styles.active : ""
                        }`}
                    >
                        {tag.caratteristica}
                    </span>
                ))}

                {categoriaFiltro && (
                    <span
                        className={styles.categoriaBadge}
                        onClick={() => navigate("/componenti")}
                    >
                        {categorie.find(c => c.id === parseInt(categoriaFiltro))?.nome}
                        <span className={styles.badgeX}>×</span>
                    </span>
                )}

                {posizioneFiltro && (
                    <span
                        className={styles.categoriaBadge}
                        onClick={() => navigate("/componenti")}
                    >
                        {locations.find(l => l.id === parseInt(posizioneFiltro))?.nome}
                        <span className={styles.badgeX}>×</span>
                    </span>
                )}
            </div>

            <div className={styles.container}>
                <div className={styles.griglia}>
                    {componentiFiltrati.map(componente => (
                        <ComponenteCard
                            key={componente.id}
                            componente={componente}
                            categorie={categorie}
                            tagComponents={tagComponents.filter(tc => tc.component === componente.id)}
                            tags={tags}
                        />
                    ))}
                </div>
            </div>
            <Fab destination="/componenti/aggiungi" utente={utente} />
        </div>
    );
}

export default Componenti;
