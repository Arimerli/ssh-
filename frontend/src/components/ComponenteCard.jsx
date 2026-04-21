import { useNavigate } from "react-router-dom";

import styles from "./ComponenteCard.module.css";

function ComponenteCard({ componente, categorie, tagComponents }) {

    const navigate = useNavigate();

    function costruisciPercorsoCategoria(categoriaId) {
        const percorso = [];
        let id = categoriaId;

        while(id){
            const cat = categorie.find(c => c.id === id);
            if (!cat) break;
            percorso.unshift(cat.nome);
            id = cat.parent;
        }
        return percorso.join(" > ");
    }

    return (
        <div
            className={styles.card}
            onClick={() => navigate(`/componenti/${componente.id}`)}
        >
        <div className={styles.nome}>{componente.nome}</div>
        <div className={styles.categoria}>
            {costruisciPercorsoCategoria(componente.categoria)}
        </div>
        <div className={styles.tags}>
            {tagComponents.map(tc => (
                <span kay={tc.id} className={styles.tag}>
                    {tc.caratteristica}
                </span>
            ))}
        </div>
        </div>
    );
}

export default ComponenteCard;