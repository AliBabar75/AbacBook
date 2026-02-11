import { getDashboardData } from "../services/dashboard.service.js";

export const dashboard = async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
