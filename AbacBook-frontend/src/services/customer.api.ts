import api from "@/services/api";
export const getCustomers = async () => {
  return api.get("/api/customers");
};