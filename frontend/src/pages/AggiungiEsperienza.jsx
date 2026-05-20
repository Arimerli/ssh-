import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AggiungiComponente.module.css";
import api from "../api/api";
import { getComponenti } from "../api/api";

function AggiungiEsperienza() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [descrizione, setDescrizione] = useState("");
    const [componenti, setComponenti] = useState([]);
    const [componentiSelezionati, setComponentiSelezionati] = useState([]);
    const [ricerca, setRicerca] = useState("");
    const [pdf, setPdf] = useState(null);

    useEffect(() => {
        getComponenti().then(res => setComponenti(res.data));
    }, []);

    function toggleComponente(id) {
        setComponentiSelezionati(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
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

        const res = await api.post("/esperienze/", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        const esperienzaId = res.data.id;

        for (const compId of componentiSelezionati) {
            await api.post("/esperienze-components/", {
                esperienza: esperienzaId,
                component: compId,
            });
        }

        navigate("/esperienze");
    }

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <button className={styles.back} onClick={() => navigate("/esperienze")}>
                    ← Torna indietro
                </button>
                <h1 className={styles.titolo}>
                    <span className={styles.titoloAccento}>Aggiungi </span>
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
                        placeholder="es. Amplificatore audio"
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>Descrizione</label>
                    <textarea
                        className={styles.textarea}
                        value={descrizione}
                        onChange={e => setDescrizione(e.target.value)}
                        placeholder="Descrizione dell'esperienza..."
                        rows={3}
                    />
                </div>
                <div className={styles.campo}>
                    <label className={styles.label}>PDF esperienza</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => setPdf(e.target.files[0])}
                        className={styles.input}
                    />
                    {pdf && (
                        <div style={{ fontSize: 12, color: "var(--accent)", marginTop: 4 }}>
                            📄 {pdf.name}
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
                Salva esperienza
            </button>
        </div>
    );
}

export default AggiungiEsperienza;
