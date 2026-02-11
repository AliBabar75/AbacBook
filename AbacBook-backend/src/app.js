import express from "express";
import cors from "cors";
import { errorHandler } from "./shared/errors/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import ledgerRoutes from "./routes/ledger.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import itemRoutes from "../src/routes/item.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import purchaseReturnRoutes from "./routes/purchaseReturn.routes.js";
import salesReturnRoutes from "./routes/salesReturn.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "chalgaya ree baba", message: "boom up" });
});
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/items", itemRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/recipe", recipeRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchase-returns", purchaseReturnRoutes);
app.use("/api/sales-returns", salesReturnRoutes);

app.use(errorHandler);

export default app;
