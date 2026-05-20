import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getComponente,
  getGiacenzaComponente,
  getCategorie,
  getLocations,
  getTags,
  getTagComponents,
  aggiornaComponente,
  aggiornaGiacenza,
  eliminaGiacenza,
} from "../api/api";
import api from "../api/api";
import styles from "./ModificaComponente.module.css";

function ModificaComponente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [link, setLink] = useState("");
  const [categorie, setCategorie] = useState([]);
  const [categoriaSelezionata, setCategoriaSelezionata] = useState(null);
  const [livelli, setLivelli] = useState([null]);
  const [nuovaCategoria, setNuovaCategoria] = useState("");
  const [mostraNuovaCategoria, setMostraNuovaCategoria] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagSelezionati, setTagSelezionati] = useState([]);
  const [nuovoTag, setNuovoTag] = useState("");
  const [mostraNuovoTag, setMostraNuovoTag] = useState(false);
  const [locations, setLocations] = useState([]);
  const [scorta, setScorta] = useState(false);
  const [giacenze, setGiacenze] = useState([]);
  const [giacenzeOriginali, setGiacenzeOriginali] = useState([]);
  const [tagComponentsOriginali, setTagComponentsOriginali] = useState([]);

  function costruisciLivelli(lista, itemId) {
    const percorso = [];
    let corrente = lista.find((x) => x.id === itemId);
    while (corrente) {
      percorso.unshift(corrente.id);
      corrente = lista.find((x) => x.id === corrente.parent);
    }
    const ultimo = percorso[percorso.length - 1];
    if (lista.some((x) => x.parent === ultimo)) percorso.push(null);
    return percorso;
  }

  useEffect(() => {
    Promise.all([
      getComponente(id),
      getGiacenzaComponente(id),
      getCategorie(),
      getLocations(),
      getTags(),
      getTagComponents(),
    ]).then(([compRes, giacRes, catRes, locRes, tagRes, tagCompRes]) => {
      const comp = compRes.data;
      const cats = catRes.data;
      const locs = locRes.data;

      setNome(comp.nome);
      setLink(comp.link || "");
      setCategorie(cats);
      setLocations(locs);
      setTags(tagRes.data);

      if (comp.categoria) {
        setCategoriaSelezionata(comp.categoria);
        setLivelli(costruisciLivelli(cats, comp.categoria));
      }

      const giacenzeCaricate = giacRes.data
        .filter((g) => g.componente === parseInt(id))
        .map((g) => ({
          id: g.id,
          livelloLoc: costruisciLivelli(locs, g.cassetto),
          locationSelezionata: g.cassetto,
          quantita: g.quantita,
          minQuantita: g.min_quantita,
          nuova: false,
        }));
      setGiacenze(giacenzeCaricate);
      setGiacenzeOriginali(giacenzeCaricate.map((g) => g.id));

      if (giacRes.data.length > 0) {
        setScorta(giacRes.data[0].scorta);
      }

      const tagIds = tagCompRes.data
        .filter((tc) => tc.component === parseInt(id))
        .map((tc) => tc.tag);
      setTagSelezionati(tagIds);
      setTagComponentsOriginali(
        tagCompRes.data.filter((tc) => tc.component === parseInt(id)),
      );
    });
  }, [id]);

  function figli(lista, parentId) {
    return lista.filter((c) => c.parent === parentId);
  }

  function selezionaCategoria(livello, catId) {
    const nuoviLivelli = [...livelli.slice(0, livello + 1)];
    nuoviLivelli[livello] = catId;
    if (figli(categorie, catId).length > 0) nuoviLivelli.push(null);
    setLivelli(nuoviLivelli);
    setCategoriaSelezionata(catId);
  }

  function selezionaLocation(giacenzaIndex, livello, locId) {
    setGiacenze((prev) =>
      prev.map((g, i) => {
        if (i !== giacenzaIndex) return g;
        const nuoviLivelli = [...g.livelloLoc.slice(0, livello + 1)];
        nuoviLivelli[livello] = locId;
        if (figli(locations, locId).length > 0) nuoviLivelli.push(null);
        return { ...g, livelloLoc: nuoviLivelli, locationSelezionata: locId };
      }),
    );
  }

  function aggiornaGiacenzaField(index, field, value) {
    setGiacenze((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  }

  function aggiungiRigaGiacenza() {
    setGiacenze((prev) => [
      ...prev,
      {
        id: null,
        livelloLoc: [null],
        locationSelezionata: null,
        quantita: 0,
        minQuantita: 0,
        nuova: true,
      },
    ]);
  }

  function rimuoviRigaGiacenza(index) {
    setGiacenze((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleTag(tagId) {
    setTagSelezionati((prev) =>
      prev.includes(tagId) ? prev.filter((i) => i !== tagId) : [...prev, tagId],
    );
  }

  async function aggiungiCategoria() {
    if (!nuovaCategoria.trim()) return;
    const res = await api.post("/categories/", {
      nome: nuovaCategoria,
      parent: categoriaSelezionata,
    });
    setCategorie((prev) => [...prev, res.data]);
    selezionaCategoria(livelli.length - 1, res.data.id);
    setNuovaCategoria("");
    setMostraNuovaCategoria(false);
  }

  async function aggiungiTag() {
    if (!nuovoTag.trim()) return;
    const res = await api.post("/tags/", { caratteristica: nuovoTag });
    setTags((prev) => [...prev, res.data]);
    setTagSelezionati((prev) => [...prev, res.data.id]);
    setNuovoTag("");
    setMostraNuovoTag(false);
  }

  const totale = giacenze.reduce(
    (acc, g) => acc + (parseInt(g.quantita) || 0),
    0,
  );

  async function salva() {
    if (!nome.trim() || !categoriaSelezionata) {
      alert("Compila nome e categoria!");
      return;
    }
    if (giacenze.some((g) => !g.locationSelezionata)) {
      alert("Seleziona la posizione per ogni giacenza!");
      return;
    }
    const posizioni = giacenze.map((g) => g.locationSelezionata);
    if (new Set(posizioni).size !== posizioni.length) {
      alert("Non puoi usare lo stesso cassetto due volte!");
      return;
    }

    await aggiornaComponente(id, {
      nome,
      link,
      categoria: categoriaSelezionata,
      pezzi: totale,
    });

    const giacenzeAttualiIds = giacenze.filter((g) => g.id).map((g) => g.id);
    for (const gId of giacenzeOriginali) {
      if (!giacenzeAttualiIds.includes(gId)) {
        await eliminaGiacenza(gId);
      }
    }

    for (const g of giacenze) {
      const payload = {
        componente: parseInt(id),
        cassetto: g.locationSelezionata,
        quantita: parseInt(g.quantita) || 0,
        min_quantita: parseInt(g.minQuantita) || 0,
        scorta,
      };
      if (g.id) {
        await aggiornaGiacenza(g.id, payload);
      } else {
        await api.post("/giacenze/", payload);
      }
    }

    for (const tc of tagComponentsOriginali) {
      await api.delete(`/tag-components/${tc.id}/`);
    }
    for (const tagId of tagSelezionati) {
      await api.post("/tag-components/", {
        tag: tagId,
        component: parseInt(id),
      });
    }

    navigate(`/componenti/${id}`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.back}
          onClick={() => navigate(`/componenti/${id}`)}
        >
          ← Torna indietro
        </button>
        <h1 className={styles.titolo}>
          <span className={styles.titoloAccento}>Modifica </span>
          componente
        </h1>
      </div>

      <div className={styles.sezione}>
        <div className={styles.sezioneLabel}>Dati base</div>
        <div className={styles.campo}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>Link datasheet</label>
          <input
            className={styles.input}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className={styles.sezione}>
        <div className={styles.sezioneLabel}>Categoria</div>
        <div className={styles.cascata}>
          {livelli.map((selezionato, i) => {
            const parentId = i === 0 ? null : livelli[i - 1];
            const opzioni = figli(categorie, parentId);
            if (opzioni.length === 0) return null;
            return (
              <select
                key={i}
                className={styles.select}
                value={selezionato || ""}
                onChange={(e) =>
                  selezionaCategoria(i, parseInt(e.target.value))
                }
              >
                <option value="">Seleziona...</option>
                {opzioni.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            );
          })}
          <button
            className={styles.btnNuovo}
            onClick={() => setMostraNuovaCategoria(true)}
          >
            + Nuova
          </button>
        </div>
        {mostraNuovaCategoria && (
          <div className={styles.nuovoInline}>
            <input
              className={styles.input}
              value={nuovaCategoria}
              onChange={(e) => setNuovaCategoria(e.target.value)}
              placeholder="Nome nuova categoria"
            />
            <button
              className={styles.btnSalvaNuovo}
              onClick={aggiungiCategoria}
            >
              Aggiungi
            </button>
            <button
              className={styles.btnAnnulla}
              onClick={() => setMostraNuovaCategoria(false)}
            >
              Annulla
            </button>
          </div>
        )}
      </div>

      <div className={styles.sezione}>
        <div className={styles.sezioneLabel}>Tag</div>
        <div className={styles.tagLista}>
          {tags.map((tag) => (
            <span
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`${styles.tag} ${tagSelezionati.includes(tag.id) ? styles.tagAttivo : ""}`}
            >
              {tag.caratteristica}
            </span>
          ))}
          <button
            className={styles.btnNuovo}
            onClick={() => setMostraNuovoTag(true)}
          >
            + Nuovo
          </button>
        </div>
        {mostraNuovoTag && (
          <div className={styles.nuovoInline}>
            <input
              className={styles.input}
              value={nuovoTag}
              onChange={(e) => setNuovoTag(e.target.value)}
              placeholder="Nome nuovo tag"
            />
            <button className={styles.btnSalvaNuovo} onClick={aggiungiTag}>
              Aggiungi
            </button>
            <button
              className={styles.btnAnnulla}
              onClick={() => setMostraNuovoTag(false)}
            >
              Annulla
            </button>
          </div>
        )}
      </div>

      <div className={styles.sezione}>
        <div className={styles.sezioneLabelRow}>
          <div className={styles.sezioneLabel}>Posizioni e giacenze</div>
          <span className={styles.totale}>Totale: {totale} pezzi</span>
        </div>

        {giacenze.map((g, index) => (
          <div key={index} className={styles.giacenzaRiga}>
            <div className={styles.giacenzaHeader}>
              <span className={styles.giacenzaNumero}>
                Posizione {index + 1}
              </span>
              {giacenze.length > 1 && (
                <button
                  className={styles.btnRimuovi}
                  onClick={() => rimuoviRigaGiacenza(index)}
                >
                  × Rimuovi
                </button>
              )}
            </div>
            <div className={styles.cascata}>
              {g.livelloLoc.map((selezionato, i) => {
                const parentId = i === 0 ? null : g.livelloLoc[i - 1];
                const opzioni = figli(locations, parentId);
                if (opzioni.length === 0) return null;
                return (
                  <select
                    key={i}
                    className={styles.select}
                    value={selezionato || ""}
                    onChange={(e) =>
                      selezionaLocation(index, i, parseInt(e.target.value))
                    }
                  >
                    <option value="">Seleziona...</option>
                    {opzioni.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                );
              })}
            </div>
            <div className={styles.riga}>
              <div className={styles.campo}>
                <label className={styles.label}>Quantità</label>
                <input
                  className={styles.inputNumero}
                  type="number"
                  value={g.quantita}
                  onChange={(e) =>
                    aggiornaGiacenzaField(index, "quantita", e.target.value)
                  }
                />
              </div>
              <div className={styles.campo}>
                <label className={styles.label}>Quantità minima</label>
                <input
                  className={styles.inputNumero}
                  type="number"
                  value={g.minQuantita}
                  onChange={(e) =>
                    aggiornaGiacenzaField(index, "minQuantita", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        ))}

        <button
          className={styles.btnAggiungiPosizione}
          onClick={aggiungiRigaGiacenza}
        >
          + Aggiungi posizione
        </button>

        <div className={styles.scortaRiga}>
          <input
            type="checkbox"
            id="scorta"
            checked={scorta}
            onChange={(e) => setScorta(e.target.checked)}
          />
          <label htmlFor="scorta" className={styles.checkboxLabel}>
            Scorta presente
          </label>
        </div>
      </div>

      <button className={styles.btnSalva} onClick={salva}>
        Salva modifiche
      </button>
    </div>
  );
}

export default ModificaComponente;
