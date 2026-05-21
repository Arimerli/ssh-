import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DettaglioEsperienza.module.css";
import api from "../api/api";
import { getComponenti } from "../api/api";

function DettaglioEsperienza({ utente }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [esperienza, setEsperienza] = useState(null);
    const [esperienzaComponents, setEsperienzaComponents] = useState([]);
    const [componenti, setComponenti] = useState([]);
    const [confermaElimina, setConfermaElimina] = useState(false);

    useEffect(() => {
        api.get(`/esperienze/${id}/`).then(res => setEsperienza(res.data));
        api.get(`/esperienze-components/?esperienza=${id}`).then(res => setEsperienzaComponents(res.data));
        getComponenti().then(res => setComponenti(res.data));
    }, [id]);

    async function elimina() {
        for (const ec of esperienzaComponents) {
            await api.delete(`/esperienze-components/${ec.id}/`);
        }
        await api.delete(`/esperienze/${id}/`);
        navigate("/esperienze");
    }

    if (!esperienza) return null;

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate("/esperienze")}>
                    ← Torna indietro
                </button>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Dettaglio </span>
                    esperienza
                </h1>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Informazioni</div>
                <div className={styles.nome}>{esperienza.nome}</div>
                {esperienza.descrizione && (
                    <div className={styles.descrizione}>{esperienza.descrizione}</div>
                )}
               {esperienza.pdf && (
    <div style={{ marginTop: 12 }}>
        <button
            onClick={async () => {
                const url = esperienza.pdf.startsWith('http')
                    ? esperienza.pdf
                    : `http://localhost:8000${esperienza.pdf}`;
                const res = await fetch(url);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, "_blank");
            }}
            style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, color: "var(--accent)", background: "transparent",
                border: "1px solid var(--accent)", borderRadius: 8,
                padding: "6px 12px", cursor: "pointer"
            }}
        >
            📄 Visualizza PDF
        </button>
    </div>
)}
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Componenti utilizzati</div>
                {esperienzaComponents.length === 0 ? (
                    <div className={styles.vuoto}>Nessun componente collegato</div>
                ) : (
                    <div className={styles.listaComponenti}>
                        {esperienzaComponents.map(ec => {
                            const comp = componenti.find(c => c.id === ec.component);
                            return comp ? (
                                <div
                                    key={ec.id}
                                    className={styles.componenteRiga}
                                    onClick={() => navigate(`/componenti/${comp.id}?from=esperienze&esperienzaId=${id}`)}
                                >
                                    <span className={styles.componenteNome}>{comp.nome}</span>
                                    <span className={styles.componenteArrow}>→</span>
                                </div>
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            {(utente?.ruolo === 'Amministratore' || utente?.ruolo === 'Tecnico') && (
                <div className={styles.azioni}>
                    <button
                        className={styles.btnModifica}
                        onClick={() => navigate(`/esperienze/${id}/modifica`)}
                    >
                        Modifica
                    </button>
                    {!confermaElimina ? (
                        <button
                            className={styles.btnElimina}
                            onClick={() => setConfermaElimina(true)}
                        >
                            Elimina
                        </button>
                    ) : (
                        <div className={styles.conferma}>
                            <span className={styles.confermaTestp}>Sei sicuro?</span>
                            <button className={styles.btnConfermaElimina} onClick={elimina}>Sì, elimina</button>
                            <button className={styles.btnAnnulla} onClick={() => setConfermaElimina(false)}>Annulla</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DettaglioEsperienza;
