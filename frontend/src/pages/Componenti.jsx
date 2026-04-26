import { useState, useEffect } from "react";
import { getComponenti , getCategorie , getTagComponents, getTags } from "../api/api"; //funzioni x le api di django comunicazione front-back
import styles from "./Componenti.module.css";
import ComponenteCard from "../components/ComponenteCard";
import { useNavigate } from "react-router-dom";
import Fab from "../components/Fab";

function Componenti({ searchQuery, utente }) {
    const [componenti, setComponenti] = useState([]); //crea variabile componenti che permette di aggiornare la pagina ogni volta che setComponenti viene chiamata
    const [categorie, setCategorie] = useState([]);
    const [tagComponents, setTagComponents] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const navigate = useNavigate();

    console.log("utente:", utente);
    //se schiacciamo su uno lo mette o lo rimuove da selectedTags in base a se c'è o non c'è in precedenza
    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
            ? prev.filter(id => id !== tagId)
            :[...prev,tagId]
        );
    };

    const componentiFiltrati = componenti
    .filter(c =>
        c.nome.toLowerCase().includes((searchQuery || "").toLowerCase())
    )
    .filter(c => {
        if (selectedTags.length === 0) return true;

        const componentTagIds = tagComponents
            .filter(tc => tc.component === c.id)
            .map(tc => tc.tag);

        return selectedTags.every(tagId =>
            componentTagIds.includes(tagId)
        );
    });

    useEffect(() => {
        getComponenti().then(res => setComponenti(res.data)); // prende i dati da getComponenti appena viene caricata la pagina
        getCategorie().then(res => setCategorie(res.data));
        getTagComponents().then(res => setTagComponents(res.data));
        getTags().then(res => setTags(res.data));
    },[]);

    console.log(tags);

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
            </div>
            <div className={styles.container}>
                <div className={styles.griglia}>
                    {componentiFiltrati.map(componente => (
                        <ComponenteCard
                        key={componente.id}
                        componente={componente}
                        categorie={categorie}
                        tagComponents={tagComponents.filter(tc => tc.component === componente.id)}
                        />
                    ))}
                </div>
            </div>
            <Fab destination="/componenti/aggiungi" utente={utente} />
        </div>
    );
}

export default Componenti;