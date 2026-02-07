// import { Router } from "express";
// import {
//   createSupplier,
//   listSuppliers,
// } from "../controllers/supplier.controller.js";
// import { authMiddleware } from "../middlewares/auth.middlewares.js";

// const router = Router();

// router.get("/", authMiddleware, listSuppliers);
// router.post("/", authMiddleware, createSupplier);

// export default router;
import { Router } from "express";
import {
  createSupplier,
  listSuppliers,
} from "../controllers/supplier.controller.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/", authMiddleware, listSuppliers);
router.post("/", authMiddleware, createSupplier);

export default router;
