import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    getComponente,
    getGiacenze,
    getCategorie,
    getLocations,
    getTags,
    getTagComponents,
} from "../api/api";
import api from "../api/api";
import styles from "./DettaglioComponente.module.css";

function DettaglioComponente({ utente }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // legge da dove si è arrivati
    const from = searchParams.get("from");
    const esperienzaId = searchParams.get("esperienzaId");

    const [componente, setComponente] = useState(null);
    const [giacenze, setGiacenze] = useState([]);
    const [categorie, setCategorie] = useState([]);
    const [locations, setLocations] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagComponents, setTagComponents] = useState([]);

useEffect(() => {
    getComponente(id).then(res => setComponente(res.data));
    getGiacenze().then(res => {
        const filtrate = res.data.filter(g => g.componente === parseInt(id));
        setGiacenze(filtrate);
    });
    getCategorie().then(res => setCategorie(res.data));
    getLocations().then(res => setLocations(res.data));
    getTags().then(res => setTags(res.data));
    getTagComponents().then(res => setTagComponents(res.data));
}, [id]);

    function tornaIndietro() {
        if (from === "esperienze" && esperienzaId) {
            navigate(`/esperienze/${esperienzaId}`);
        } else {
            navigate("/componenti");
        }
    }

    async function handleElimina() {
        if (!window.confirm(`Sei sicuro di voler eliminare "${componente.nome}"?`)) return;
        await api.delete(`/components/${id}/`);
        navigate("/componenti");
    }

    function breadcrumb(lista, itemId) {
        const percorso = [];
        let corrente = lista.find(x => x.id === itemId);
        while (corrente) {
            percorso.unshift(corrente);
            corrente = lista.find(x => x.id === corrente.parent);
        }
        return percorso;
    }

    function coloreQuantita(g) {
        if (g.quantita === 0) return styles.indicatoreRosso;
        if (g.quantita <= g.min_quantita) return styles.indicatoreGiallo;
        return styles.indicatoreVerde;
    }

    if (!componente) return null;

    const tagDelComponente = tagComponents
        .filter(tc => tc.component === componente.id)
        .map(tc => tags.find(t => t.id === tc.tag))
        .filter(Boolean);

    const breadcrumbCategoria = breadcrumb(categorie, componente.categoria);
    const totale = giacenze.reduce((acc, g) => acc + g.quantita, 0);

    const linkDatasheet = componente.link ? (
        <a href={componente.link} target="_blank" rel="noreferrer" className={styles.datasheet}>
            📄 Datasheet
        </a>
    ) : null;

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <button className={styles.back} onClick={tornaIndietro}>
                    ← Torna indietro
                </button>
                {(utente?.ruolo === 'Amministratore' || utente?.ruolo === 'Tecnico') && (
                    <div className={styles.headerAzioni}>
                        <button
                            className={styles.btnModifica}
                            onClick={() => navigate(`/componenti/${id}/modifica`)}
                        >
                            Modifica
                        </button>
                        <button
                            className={styles.btnElimina}
                            onClick={handleElimina}
                        >
                            Elimina
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.sezione}>
                <h1 className={styles.nome}>{componente.nome}</h1>
                <div className={styles.tagLista}>
                    {tagDelComponente.map(tag => (
                        <span key={tag.id} className={styles.tag}>
                            {tag.caratteristica}
                        </span>
                    ))}
                </div>
                {linkDatasheet}
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Categoria</div>
                <div className={styles.breadcrumb}>
                    {breadcrumbCategoria.map((cat, i) => (
                        <span key={cat.id}>
                            {i > 0 && <span className={styles.freccia}>›</span>}
                            <span className={i === breadcrumbCategoria.length - 1 ? styles.breadcrumbAttivo : styles.breadcrumbItem}>
                                {cat.nome}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {giacenze.length > 0 && (
                <div className={styles.sezione}>
                    <div className={styles.sezioneLabelRow}>
                        <div className={styles.sezioneLabel}>Giacenza</div>
                        <span className={styles.totaleLabel}>Totale: <strong>{totale}</strong> pezzi</span>
                    </div>
                    <table className={styles.tabella}>
                        <thead>
                            <tr>
                                <th className={styles.th}>Posizione</th>
                                <th className={styles.th}>Quantità</th>
                                <th className={styles.th}>Minimo</th>
                                <th className={styles.th}>Scorta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {giacenze.map((g, i) => {
                                const pos = breadcrumb(locations, g.cassetto);
                                return (
                                    <tr key={g.id} className={i % 2 === 0 ? styles.trPari : styles.trDispari}>
                                        <td className={styles.td}>
                                            {pos.map((loc, j) => (
                                                <span key={loc.id}>
                                                    {j > 0 && <span className={styles.freccia}>›</span>}
                                                    <span className={j === pos.length - 1 ? styles.breadcrumbAttivo : styles.breadcrumbItem}>
                                                        {loc.nome}
                                                    </span>
                                                </span>
                                            ))}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.indicatore} ${coloreQuantita(g)}`} />
                                            {g.quantita}
                                        </td>
                                        <td className={styles.td}>{g.min_quantita}</td>
                                        <td className={styles.td}>
                                            <span className={g.scorta ? styles.scortaSi : styles.scortaNo}>
                                                {g.scorta ? "✓ Sì" : "✗ No"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DettaglioComponente;
