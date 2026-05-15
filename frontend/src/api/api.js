import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.replace("/login");
            return;
        }
        return Promise.reject(error);
    }
);


export const getComponenti = () => api.get("/components/");
export const getComponente = (id) => api.get(`/components/${id}/`);
export const getCategorie = () => api.get("/categories/");
export const getLocations = () => api.get("/locations/");
export const getGiacenze = () => api.get("/giacenze/");
export const getGiacenzaComponente = (id) => api.get(`/giacenze/?componente=${id}`);
export const aggiornaGiacenza = (id, data) => api.patch(`/giacenze/${id}/`, data);
export const eliminaGiacenza = (id) => api.delete(`/giacenze/${id}/`);
export const aggiornaComponente = (id, data) => api.patch(`/components/${id}/`, data);
export const getTags = () => api.get("/tags/");
export const getTagComponents = () => api.get("/tag-components/");
export const getUtenteCorrente = () => api.get("/utente/");
export const loginUtente = (username, password) =>
    api.post("/utente/login/", { username, password });
export const logoutUtente = () => api.post("/utente/logout/");
export const cambiaPassword = (vecchia, nuova) =>
    api.post('/utente/cambia-password/', {
        vecchia_password: vecchia,
        nuova_password: nuova,
    });
export const resetPassword = (userId) =>
    api.post(`/utente/${userId}/reset-password/`);
export const creaUtente = (dati) => api.post('/utente/crea/', dati);
export const getLog = () => api.get("/log/");
export const getLogUtente = (userId) => api.get(`/log/?utente=${userId}`);
export const getUtenti = () => api.get("/utenti/");
export const aggiornaProfiloUtente = (data) => api.post("/utente/aggiorna-profilo/", data);

export const aggiornaUtente = (id, data) =>
    api.patch(`/utenti/${id}/aggiorna/`, data);

export const eliminaUtente = (id) =>
    api.delete(`/utenti/${id}/elimina/`);

export const richiediResetPassword = (email) =>
    api.post('/utente/richiedi-reset/', { email });
export const creaPosizione = (dati) => api.post('/posizioni/crea/', dati);

export const getEsperienze = () => api.get("/esperienze/");
export const getEsperienzeComponents = (id) => api.get(`/esperienze-components/?esperienza=${id}`);
export const getAcquisti = () => api.get("/acquisti/");

export const eliminaCategoria = (id) =>
    api.delete(`/categories/${id}/elimina/`);

export const modificaCategoria = (id, nome) =>
    api.patch(`/categories/${id}/modifica/`, { nome });

export const eliminaPosizione = (id) =>
    api.delete(`/locations/${id}/elimina/`);

export const modificaPosizione = (id, nome) =>
    api.patch(`/locations/${id}/modifica/`, { nome });

export default api;