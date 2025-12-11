import { Router } from "express";
import { GetTransactionsController } from "../controllers/wallet.controller.js";

const router = Router();

router.get("/:userId", GetTransactionsController);

export default router;
