import { useState, useEffect } from "react";
import { getComponenti , getCategorie , getTagComponents } from "../api/api"; //funzioni x le api di django comunicazione front-back
import styles from "./Componenti.module.css";
import ComponenteCard from "../components/ComponenteCard";

function Componenti({ searchQuery }) {
    const [componenti, setComponenti] = useState([]); //crea variabile componenti che permette di aggiornare la pagina ogni volta che setComponenti viene chiamata
    const [categorie, setCategorie] = useState([]);
    const [tagComponents, setTagComponents] = useState([])

    useEffect(() => {
        getComponenti().then(res => setComponenti(res.data)); // prende i dati da getComponenti appena viene caricata la pagina
        getCategorie().then(res => setCategorie(res.data));
        getTagComponents().then(res => setTagComponents(res.data));
    },[]);
    const componentiFiltrati = componenti.filter( c => c.nome.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <h1 className={styles.titolo}>Componenti</h1>
            </div>
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
    );
}

export default Componenti;