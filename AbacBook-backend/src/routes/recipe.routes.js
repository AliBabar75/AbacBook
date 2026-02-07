import express from "express";
import { produceAttar } from "../controllers/recipe.controller.js";

const router = express.Router();

router.post("/produce", produceAttar);

export default router;
