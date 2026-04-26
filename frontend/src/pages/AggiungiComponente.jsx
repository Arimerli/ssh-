import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorie, getLocations, getTags } from "../api/api";
import styles from "./AggiungiComponente.module.css";
import api from "../api/api";

function AggiungiComponente() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [link, setLink] = useState("");
    const [categorie, setCategorie] = useState([]);
    const [categoriaSelezionata, setCategoriaSelezionata] = useState(null);
    const [livelli, setLivelli] = useState([null]);
    const [nuovaCategoria, setNuovaCategoria] = useState("");
    const [mostraNuovaCategoria, setMostraNuovaCategoria] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagSelezionati, setTagSelezionati] = useState([]);
    const [nuovoTag, setNuovoTag] = useState("");
    const [mostraNuovoTag, setMostraNuovoTag] = useState(false);
    const [locations, setLocations] = useState([]);
    const [livelloLoc, setLivelloLoc] = useState([null]);
    const [locationSelezionata, setLocationSelezionata] = useState(null);
    const [quantita, setQuantita] = useState(0);
    const [minQuantita, setMinQuantita] = useState(0);
    const [scorta, setScorta] = useState(false);

    useEffect(() => {
        getCategorie().then(res => setCategorie(res.data));
        getLocations().then(res => setLocations(res.data));
        getTags().then(res => setTags(res.data));
    }, []);

    function figli(lista, parentId) {
        return lista.filter(c => c.parent === parentId);
    }

    function selezionaCategoria(livello, id) {
        const nuoviLivelli = [...livelli.slice(0, livello + 1)];
        nuoviLivelli[livello] = id;
        if (figli(categorie, id).length > 0) {
            nuoviLivelli.push(null);
        }
        setLivelli(nuoviLivelli);
        setCategoriaSelezionata(id);
    }

    function selezionaLocation(livello, id) {
        const nuoviLivelli = [...livelloLoc.slice(0, livello + 1)];
        nuoviLivelli[livello] = id;
        if (figli(locations, id).length > 0) {
            nuoviLivelli.push(null);
        }
        setLivelloLoc(nuoviLivelli);
        setLocationSelezionata(id);
    }

    function toggleTag(tagId) {
        setTagSelezionati(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    }

    async function aggiungiCategoria() {
        if (!nuovaCategoria.trim()) return;
        const res = await api.post("/categories/", {
            nome: nuovaCategoria,
            parent: categoriaSelezionata,
        });
        setCategorie(prev => [...prev, res.data]);
        selezionaCategoria(livelli.length - 1, res.data.id);
        setNuovaCategoria("");
        setMostraNuovaCategoria(false);
    }

    async function aggiungiTag() {
        if (!nuovoTag.trim()) return;
        const res = await api.post("/tags/", { caratteristica: nuovoTag });
        setTags(prev => [...prev, res.data]);
        setTagSelezionati(prev => [...prev, res.data.id]);
        setNuovoTag("");
        setMostraNuovoTag(false);
    }

    async function salva() {
        if (!nome.trim() || !categoriaSelezionata || !locationSelezionata) {
            alert("Compila nome, categoria e posizione!");
            return;
        }
        const resComponente = await api.post("/components/", {
            nome,
            link,
            categoria: categoriaSelezionata,
            pezzi: quantita,
        });
        const componenteId = resComponente.data.id;
        await api.post("/giacenze/", {
            componente: componenteId,
            cassetto: locationSelezionata,
            quantita,
            min_quantita: minQuantita,
            scorta,
        });
        for (const tagId of tagSelezionati) {
            await api.post("/tag-components/", {
                tag: tagId,
                component: componenteId,
            });
        }
        navigate("/componenti");
    }

    return (
        <div className={styles.container}>
           <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate("/componenti")}>
                    ← Torna indietro
                </button>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Aggiungi </span>
                    componente
                </h1>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Dati base</div>
                <div className={styles.campo}>
                    <label className={styles.label}>Nome</label>
                    <input
                        className={styles.input}
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="es. Resistenza 10kΩ"
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>Link datasheet</label>
                    <input
                        className={styles.input}
                        value={link}
                        onChange={e => setLink(e.target.value)}
                        placeholder="https://..."
                    />
                </div>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Categoria</div>
                <div className={styles.cascata}>
                    {livelli.map((selezionato, i) => {
                        const parentId = i === 0 ? null : livelli[i - 1];
                        const opzioni = figli(categorie, parentId);
                        if (opzioni.length === 0) return null;
                        return (
                            <select
                                key={i}
                                className={styles.select}
                                value={selezionato || ""}
                                onChange={e => selezionaCategoria(i, parseInt(e.target.value))}
                            >
                                <option value="">Seleziona...</option>
                                {opzioni.map(c => (
                                    <option key={c.id} value={c.id}>{c.nome}</option>
                                ))}
                            </select>
                        );
                    })}
                    <button className={styles.btnNuovo} onClick={() => setMostraNuovaCategoria(true)}>
                        + Nuova
                    </button>
                </div>
                {mostraNuovaCategoria && (
                    <div className={styles.nuovoInline}>
                        <input
                            className={styles.input}
                            value={nuovaCategoria}
                            onChange={e => setNuovaCategoria(e.target.value)}
                            placeholder="Nome nuova categoria"
                        />
                        <button className={styles.btnSalvaNuovo} onClick={aggiungiCategoria}>Aggiungi</button>
                        <button className={styles.btnAnnulla} onClick={() => setMostraNuovaCategoria(false)}>Annulla</button>
                    </div>
                )}
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Tag</div>
                <div className={styles.tagLista}>
                    {tags.map(tag => (
                        <span
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`${styles.tag} ${tagSelezionati.includes(tag.id) ? styles.tagAttivo : ""}`}
                        >
                            {tag.caratteristica}
                        </span>
                    ))}
                    <button className={styles.btnNuovo} onClick={() => setMostraNuovoTag(true)}>
                        + Nuovo
                    </button>
                </div>
                {mostraNuovoTag && (
                    <div className={styles.nuovoInline}>
                        <input
                            className={styles.input}
                            value={nuovoTag}
                            onChange={e => setNuovoTag(e.target.value)}
                            placeholder="Nome nuovo tag"
                        />
                        <button className={styles.btnSalvaNuovo} onClick={aggiungiTag}>Aggiungi</button>
                        <button className={styles.btnAnnulla} onClick={() => setMostraNuovoTag(false)}>Annulla</button>
                    </div>
                )}
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Posizione</div>
                <div className={styles.cascata}>
                    {livelloLoc.map((selezionato, i) => {
                        const parentId = i === 0 ? null : livelloLoc[i - 1];
                        const opzioni = figli(locations, parentId);
                        if (opzioni.length === 0) return null;
                        return (
                            <select
                                key={i}
                                className={styles.select}
                                value={selezionato || ""}
                                onChange={e => selezionaLocation(i, parseInt(e.target.value))}
                            >
                                <option value="">Seleziona...</option>
                                {opzioni.map(l => (
                                    <option key={l.id} value={l.id}>{l.nome}</option>
                                ))}
                            </select>
                        );
                    })}
                </div>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Giacenza</div>
                <div className={styles.riga}>
                    <div className={styles.campo}>
                        <label className={styles.label}>Quantità</label>
                        <input
                            className={styles.inputNumero}
                            type="number"
                            value={quantita}
                            onChange={e => setQuantita(parseInt(e.target.value))}
                        />
                    </div>
                    <div className={styles.campo}>
                        <label className={styles.label}>Quantità minima</label>
                        <input
                            className={styles.inputNumero}
                            type="number"
                            value={minQuantita}
                            onChange={e => setMinQuantita(parseInt(e.target.value))}
                        />
                    </div>
                </div>
                <div className={styles.checkboxRiga}>
                    <input
                        type="checkbox"
                        id="scorta"
                        checked={scorta}
                        onChange={e => setScorta(e.target.checked)}
                    />
                    <label htmlFor="scorta" className={styles.checkboxLabel}>
                        Scorta presente
                    </label>
                </div>
            </div>

            <button className={styles.btnSalva} onClick={salva}>
                Salva componente
            </button>
        </div>
    );
}

export default AggiungiComponente;