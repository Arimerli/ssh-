import { useState, useEffect } from "react";
import { getComponenti, getCategorie, getTagComponents, getTags, getLocations, getGiacenze } from "../api/api";
import styles from "./Componenti.module.css";
import ComponenteCard from "../components/ComponenteCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import Fab from "../components/Fab";

function Componenti({ searchQuery, utente }) {
    const [componenti, setComponenti] = useState([]);
    const [categorie, setCategorie] = useState([]);
    const [tagComponents, setTagComponents] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [locations, setLocations] = useState([]);
    const [giacenze, setGiacenze] = useState([]);
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
        getComponenti().then(res => setComponenti(res.data));
        getCategorie().then(res => setCategorie(res.data));
        getTagComponents().then(res => setTagComponents(res.data));
        getTags().then(res => setTags(res.data));
        getLocations().then(res => setLocations(res.data));
        getGiacenze().then(res => setGiacenze(res.data));
    }, []);

    return (
        <div>
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