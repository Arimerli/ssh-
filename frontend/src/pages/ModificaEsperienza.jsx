import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./AggiungiComponente.module.css";
import api from "../api/api";
import { getComponenti } from "../api/api";

function ModificaEsperienza() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [descrizione, setDescrizione] = useState("");
    const [componenti, setComponenti] = useState([]);
    const [componentiSelezionati, setComponentiSelezionati] = useState([]);
    const [esperienzaComponents, setEsperienzaComponents] = useState([]);
    const [ricerca, setRicerca] = useState("");
    const [pdf, setPdf] = useState(null);
    const [pdfAttuale, setPdfAttuale] = useState(null);

    useEffect(() => {
        api.get(`/esperienze/${id}/`).then(res => {
            setNome(res.data.nome);
            setDescrizione(res.data.descrizione || "");
            setPdfAttuale(res.data.pdf || null);
        });
        api.get(`/esperienze-components/?esperienza=${id}`).then(res => {
            setEsperienzaComponents(res.data);
            setComponentiSelezionati(res.data.map(ec => ec.component));
        });
        getComponenti().then(res => setComponenti(res.data));
    }, [id]);

    function toggleComponente(compId) {
        setComponentiSelezionati(prev =>
            prev.includes(compId)
                ? prev.filter(c => c !== compId)
                : [...prev, compId]
        );
    }

    const componentiFiltrati = componenti.filter(c =>
        c.nome.toLowerCase().includes(ricerca.toLowerCase())
    );

    async function salva() {
        if (!nome.trim()) {
            alert("Inserisci il nome dell'esperienza!");
            return;
        }

        const formData = new FormData();
        formData.append("nome", nome);
        formData.append("descrizione", descrizione);
        if (pdf) formData.append("pdf", pdf);

        await api.patch(`/esperienze/${id}/`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        for (const ec of esperienzaComponents) {
            await api.delete(`/esperienze-components/${ec.id}/`);
        }
        for (const compId of componentiSelezionati) {
            await api.post("/esperienze-components/", {
                esperienza: parseInt(id),
                component: compId,
            });
        }

        navigate(`/esperienze/${id}`);
    }

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate(`/esperienze/${id}`)}>
                    ← Torna indietro
                </button>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Modifica </span>
                    esperienza
                </h1>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Dati base</div>
                <div className={styles.campo}>
                    <label className={styles.label}>Nome</label>
                    <input
                        className={styles.input}
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>Descrizione</label>
                    <textarea
                        className={styles.textarea}
                        value={descrizione}
                        onChange={e => setDescrizione(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>PDF esperienza</label>
                    {pdfAttuale && !pdf && (
                        <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 6 }}>
                            📄 PDF attuale presente —{" "}
                            <a href={`http://localhost:8000${pdfAttuale}`}
                               target="_blank"
                               rel="noreferrer"
                               style={{ color: "var(--accent)" }}>
                                Visualizza
                            </a>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdf(e.target.files[0])}
                        className={styles.input}
                    />
                    {pdf && (
                        <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 4 }}>
                            📄 Nuovo PDF: {pdf.name}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.sezione}>
                <div className={styles.sezioneLabel}>Componenti utilizzati</div>
                <input
                    className={styles.input}
                    value={ricerca}
                    onChange={e => setRicerca(e.target.value)}
                    placeholder="Cerca componente..."
                    style={{ marginBottom: 12 }}
                />
                <div className={styles.tagLista}>
                    {componentiFiltrati.map(comp => (
                        <span
                            key={comp.id}
                            onClick={() => toggleComponente(comp.id)}
                            className={`${styles.tag} ${componentiSelezionati.includes(comp.id) ? styles.tagAttivo : ""}`}
                        >
                            {comp.nome}
                        </span>
                    ))}
                </div>
            </div>

            <button className={styles.btnSalva} onClick={salva}>
                Salva modifiche
            </button>
        </div>
    );
}

export default ModificaEsperienza;
