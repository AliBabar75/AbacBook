import api from "./api";

export const stockIn = (data) => api.post("/inventory/in", data);
export const stockOut = (data) => api.post("/inventory/out", data);
export const consumeRecipe = (data) => api.post("/inventory/consume", data);

export const getRawMaterials = async () => {
  const res = await api.get("/inventory/raw-materials");
  return res.data.items;
};
export const createItem = async (data) => {
  const res = await api.post("/items", data);
  return res.data;
};


export const getFinishedGoods = async () => {
  const res = await api.get("/inventory/finished-goods");
  return res.data;
};

export const getConversionHistory = async () => {
  const res = await api.get("/inventory/conversion/history");
  return res.data;
};

// submit
export const submitConversion = async (payload) => {
  const res = await api.post("/inventory/conversion", payload);
  return res.data;
};