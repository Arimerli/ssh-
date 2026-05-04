import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorie, getComponenti } from "../api/api";
import styles from "./Categorie.module.css";

function Categorie() {
    const [categorie, setCategorie] = useState([]);
    const [componenti, setComponenti] = useState([]);
    const [aperti, setAperti] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        getCategorie().then(res => setCategorie(res.data));
        getComponenti().then(res => setComponenti(res.data));
    }, []);

    function toggleAperto(e, id) {
        e.stopPropagation();
        setAperti(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function getTutteLeCategorie(id) {
        const risultato = [id];
        const figli = categorie.filter(c => c.parent === id);
        figli.forEach(f => risultato.push(...getTutteLeCategorie(f.id)));
        return risultato;
    }

    function contaComponenti(id) {
        const tutteCategorie = getTutteLeCategorie(id);
        return componenti.filter(c => tutteCategorie.includes(c.categoria)).length;
    }

    function getSottoCategorie(id) {
        return categorie.filter(c => c.parent === id);
    }

    const coloriAccent = [
        "#0C447C",
        "#185FA5",
        "#378ADD",
        "#60a5fa",
        "#93c5fd",
    ];

    function Nodo({ id, livello }) {
        const cat = categorie.find(c => c.id === id);
        if (!cat) return null;
        const aperto = aperti[id];
        const figli = getSottoCategorie(id);
        const haFigli = figli.length > 0;
        const colore = coloriAccent[livello % coloriAccent.length];

        return (
            <div className={styles.gruppo}>
                <div
                    className={styles.riga}
                    onClick={() => navigate(`/componenti?categoria=${id}`)}
                >
                    <div className={styles.accent} style={{ background: colore }} />
                    <div className={styles.info}>
                        <div className={styles.nome} style={{ color: colore }}>
                            {cat.nome}
                        </div>
                        {!aperto && haFigli && (
                            <div className={styles.sottonomi}>
                                {figli.map(f => f.nome).join(" · ")}
                            </div>
                        )}
                    </div>
                    <div className={styles.right}>
                        <span className={styles.badge}>
                            {contaComponenti(id)} componenti
                        </span>
                        {haFigli && (
                            <span
                                className={styles.freccia}
                                onClick={e => toggleAperto(e, id)}
                            >
                                {aperto ? "▲" : "▼"}
                            </span>
                        )}
                    </div>
                </div>

                {aperto && haFigli && (
                    <div className={styles.sottoLista}>
                        {figli.map(figlio => (
                            <Nodo key={figlio.id} id={figlio.id} livello={livello + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const categorieMadre = categorie.filter(c => c.parent === null);

    return (
        <div className={styles.container}>
            <div className={styles.lista}>
                {categorieMadre.map(cat => (
                    <Nodo key={cat.id} id={cat.id} livello={0} />
                ))}
            </div>
        </div>
    );
}

export default Categorie;