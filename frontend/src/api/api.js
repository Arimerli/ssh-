import axios from "axios";

const api = axios.create({ // istanza di axios che rende di base l'indirizzo di django
    baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config
})

// export const, collega la chiamata a funzione con /api/components/
export const getComponenti = () => api.get("/components/");
export const getCategorie = () => api.get("/categories/");
export const getLocations = () => api.get("/locations/");
export const getGiacenze = () => api.get("/giacenze/");
export const getTags = () => api.get("/tags/");
export const getTagComponents = () => api.get("/tag-components/");
export const getUtenteCorrente = () => api.get("/utente/");

export const loginUtente = (username, password) =>
    api.post("/utente/login/", { username, password });

export const logoutUtente = () => api.post("/utente/logout/");