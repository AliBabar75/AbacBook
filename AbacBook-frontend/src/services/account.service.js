import api from "./api.js";

export const getAccounts = () => api.get("/accounts");
export const createAccount = (data) => api.post("/accounts", data);
