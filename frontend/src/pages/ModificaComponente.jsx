import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getComponente,
    getGiacenzaComponente,
    getCategorie,
    getLocations,
    getTags,
    getTagComponents,
    aggiornaComponente,
    aggiornaGiacenza,
} from "../api/api";
import api from "../api/api";
import styles from "./AggiungiComponente.module.css";

function ModificaComponente() {
    const { id } = useParams();
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
    const [giacenzaId, setGiacenzaId] = useState(null);
    const [tagComponentsOriginali, setTagComponentsOriginali] = useState([]);

    useEffect(() => {
        // carica tutti i dati necessari
        Promise.all([
            getComponente(id),
            getGiacenzaComponente(id),
            getCategorie(),
            getLocations(),
            getTags(),
            getTagComponents(),
        ]).then(([compRes, giacRes, catRes, locRes, tagRes, tagCompRes]) => {
            const comp = compRes.data;
            const cats = catRes.data;
            const locs = locRes.data;
            const allTagComponents = tagCompRes.data;

            // pre-compila dati base
            setNome(comp.nome);
            setLink(comp.link || "");
            setCategorie(cats);
            setLocations(locs);
            setTags(tagRes.data);

            // pre-compila categoria a cascata
            if (comp.categoria) {
                setCategoriaSelezionata(comp.categoria);
                setLivelli(costruisciLivelli(cats, comp.categoria));
            }

            // pre-compila giacenza
            if (giacRes.data.length > 0) {
                const g = giacRes.data[0];
                setGiacenzaId(g.id);
                setQuantita(g.quantita);
                setMinQuantita(g.min_quantita);
                setScorta(g.scorta);
                setLocationSelezionata(g.cassetto);
                setLivelloLoc(costruisciLivelli(locs, g.cassetto));
            }

            // pre-compila tag selezionati
            const tagIds = allTagComponents
                .filter(tc => tc.component === parseInt(id))
                .map(tc => tc.tag);
            setTagSelezionati(tagIds);
            setTagComponentsOriginali(allTagComponents.filter(tc => tc.component === parseInt(id)));
        });
    }, [id]);

    // costruisce la lista livelli risalendo i parent
    function costruisciLivelli(lista, itemId) {
        const percorso = [];
        let corrente = lista.find(x => x.id === itemId);
        while (corrente) {
            percorso.unshift(corrente.id);
            corrente = lista.find(x => x.id === corrente.parent);
        }
        // aggiunge null finale se l'ultimo ha figli
        const ultimo = percorso[percorso.length - 1];
        const haFigli = lista.some(x => x.parent === ultimo);
        if (haFigli) percorso.push(null);
        return percorso;
    }

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

        // aggiorna componente
        await aggiornaComponente(id, {
            nome,
            link,
            categoria: categoriaSelezionata,
            pezzi: quantita,
        });

        // aggiorna giacenza
        if (giacenzaId) {
            await aggiornaGiacenza(giacenzaId, {
                cassetto: locationSelezionata,
                quantita,
                min_quantita: minQuantita,
                scorta,
            });
        }

        // aggiorna tag — elimina quelli vecchi e aggiunge i nuovi
        for (const tc of tagComponentsOriginali) {
            await api.delete(`/tag-components/${tc.id}/`);
        }
        for (const tagId of tagSelezionati) {
            await api.post("/tag-components/", {
                tag: tagId,
                component: parseInt(id),
            });
        }

        navigate(`/componenti/${id}`);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate(`/componenti/${id}`)}>
                    ← Torna indietro
                </button>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Modifica </span>
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
                Salva modifiche
            </button>
        </div>
    );
}

export default ModificaComponente;