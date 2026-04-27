import { useNavigate } from "react-router-dom";
import styles from "./ComponenteCard.module.css";

function ComponenteCard({ componente, categorie, tagComponents, tags = [] }) {

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
            {tagComponents.map(tc => {
                const tag = tags.find(t => t.id === tc.tag);
                return tag ? (
                    <span key={tc.id} className={styles.tag}>
                        {tag.caratteristica}
                    </span>
                ) : null;
            })}
        </div>
        </div>
    );
}

export default ComponenteCard;