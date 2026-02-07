import api from "./api.js";

export const getItems = () => api.get("/items");
export const createItem = (data) => api.post("/items", data);
