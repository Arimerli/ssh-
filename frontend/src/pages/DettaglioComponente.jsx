import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getComponente,
    getGiacenzaComponente,
    getCategorie,
    getLocations,
    getTags,
    getTagComponents,
    aggiornaGiacenza
} from "../api/api";
import styles from "./DettaglioComponente.module.css";

function DettaglioComponente({ utente }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [componente, setComponente] = useState(null);
    const [giacenza, setGiacenza] = useState(null);
    const [categorie, setCategorie] = useState([]);
    const [locations, setLocations] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagComponents, setTagComponents] = useState([]);

    useEffect(() => {
        getComponente(id).then(res => setComponente(res.data));
        getGiacenzaComponente(id).then(res => {
            if (res.data.length > 0) setGiacenza(res.data[0]);
        });
        getCategorie().then(res => setCategorie(res.data));
        getLocations().then(res => setLocations(res.data));
        getTags().then(res => setTags(res.data));
        getTagComponents().then(res => setTagComponents(res.data));
    }, [id]);

    function breadcrumb(lista, itemId) {
        const percorso = [];
        let corrente = lista.find(x => x.id === itemId);
        while (corrente) {
            percorso.unshift(corrente);
            corrente = lista.find(x => x.id === corrente.parent);
        }
        return percorso;
    }

    async function aggiornaQuantita(delta) {
        if (!giacenza) return;
        const nuovaQuantita = giacenza.quantita + delta;
        if (nuovaQuantita < 0) return;
        const res = await aggiornaGiacenza(giacenza.id, { quantita: nuovaQuantita });
        setGiacenza(res.data);
    }

    function coloreQuantita() {
        if (!giacenza) return styles.indicatoreGrigio;
        if (giacenza.quantita === 0) return styles.indicatoreRosso;
        if (giacenza.quantita <= giacenza.min_quantita) return styles.indicatoreGiallo;
        return styles.indicatoreVerde;
    }

    if (!componente) return null;

    const tagDelComponente = tagComponents
        .filter(tc => tc.component === componente.id)
        .map(tc => tags.find(t => t.id === tc.tag))
        .filter(Boolean);

    const breadcrumbCategoria = breadcrumb(categorie, componente.categoria);
    const breadcrumbPosizione = giacenza ? breadcrumb(locations, giacenza.cassetto) : [];

    const linkDatasheet = componente.link ? (
        <a href={componente.link} target="_blank" rel="noreferrer" className={styles.datasheet}>
            Datasheet
        </a>
    ) : null;

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate("/componenti")}>
                    ← Torna indietro
                </button>
                {(utente?.ruolo === 'Amministratore' || utente?.ruolo === 'Tecnico') && (
                    <button
                        className={styles.btnModifica}
                        onClick={() => navigate(`/componenti/${id}/modifica`)}
                    >
                        Modifica
                    </button>
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

            {giacenza && (
                <div className={styles.sezione}>
                    <div className={styles.sezioneLabel}>Giacenza</div>

                    <div className={styles.quantitaRiga}>
                        <div className={styles.quantitaBox}>
                            <button className={styles.btnQuantita} onClick={() => aggiornaQuantita(-1)}>
                                −
                            </button>
                            <div className={styles.quantitaValore}>
                                <span className={`${styles.indicatore} ${coloreQuantita()}`} />
                                <span className={styles.quantitaNumero}>{giacenza.quantita}</span>
                                <span className={styles.quantitaLabel}>pezzi</span>
                            </div>
                            <button className={styles.btnQuantita} onClick={() => aggiornaQuantita(1)}>
                                +
                            </button>
                        </div>
                        <div className={styles.quantitaMin}>
                            minimo: {giacenza.min_quantita}
                        </div>
                    </div>

                    <div className={styles.campo}>
                        <div className={styles.campoLabel}>Posizione</div>
                        <div className={styles.breadcrumb}>
                            {breadcrumbPosizione.map((loc, i) => (
                                <span key={loc.id}>
                                    {i > 0 && <span className={styles.freccia}>›</span>}
                                    <span className={i === breadcrumbPosizione.length - 1 ? styles.breadcrumbAttivo : styles.breadcrumbItem}>
                                        {loc.nome}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.scorta}>
                        <span className={giacenza.scorta ? styles.scortaSi : styles.scortaNo}>
                            {giacenza.scorta ? "✓ Scorta presente" : "✗ Nessuna scorta"}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DettaglioComponente;