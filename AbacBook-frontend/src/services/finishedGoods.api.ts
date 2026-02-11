import api from "@/services/api";
export const getFinishedGoods = async () => {
  return api.get("/api/items?type=FINISHED_GOOD");
};