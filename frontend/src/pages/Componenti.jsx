import { useState, useEffect } from "react";
import { getComponenti, getCategorie, getTagComponents, getTags } from "../api/api";
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
    const navigate = useNavigate();

    // legge il parametro "categoria" dall'URL
    // es. /componenti?categoria=3 → categoriaFiltro = "3"
    const [searchParams] = useSearchParams();
    const categoriaFiltro = searchParams.get("categoria");

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
            ? prev.filter(id => id !== tagId)
            : [...prev, tagId]
        );
    };

    // funzione che trova tutte le sottocategorie di una categoria
    // serve perché se filtri "Passivi" vuoi vedere anche "Resistenze" e "THT"
    function getTutteLeCategorie(categoriaId, tutteCategorie) {
        const risultato = [parseInt(categoriaId)];
        const figli = tutteCategorie.filter(c => c.parent === parseInt(categoriaId));
        // per ogni figlio cerca ricorsivamente anche i suoi figli
        figli.forEach(figlio => {
            risultato.push(...getTutteLeCategorie(figlio.id, tutteCategorie));
        });
        return risultato;
    }

    const componentiFiltrati = componenti
        // filtra per testo di ricerca
        .filter(c =>
            c.nome.toLowerCase().includes((searchQuery || "").toLowerCase())
        )
        // filtra per categoria dall'URL — include anche le sottocategorie
        .filter(c => {
            if (!categoriaFiltro) return true;
            const categorieValide = getTutteLeCategorie(categoriaFiltro, categorie);
            return categorieValide.includes(c.categoria);
        })
        // filtra per tag selezionati
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