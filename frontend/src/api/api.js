import axios from "axios";

const api = axios.create({ // istanza di axios che rende di base l'indirizzo di django
    baseURL: "http://localhost:8000/api",
});

// export const, collega la chiamata a funzione con /api/components/
export const getComponenti = () => api.get("/components/");
export const getCategorie = () => api.get("/categories/");
export const getLocations = () => api.get("/locations/");
export const getGiacenze = () => api.get("/giacenze/");
export const getTags = () => api.get("/tags/");
export const getTagComponents = () => api.get("/tag-components/");