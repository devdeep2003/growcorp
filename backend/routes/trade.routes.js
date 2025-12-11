import { Router } from "express";
import { GetUserTradesController } from "../controllers/trade.controller.js";

const router = Router();

router.get("/:userId", GetUserTradesController);

export default router;
