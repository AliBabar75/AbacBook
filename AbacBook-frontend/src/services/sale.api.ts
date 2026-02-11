import api from "@/services/api";
export const createSale = async (payload: any) => {
  const res = await api.post("/sales", payload);
  return res.data;
};


export const getSales = async () => {
  const res = await api.get("/sales");
  return res.data;
};