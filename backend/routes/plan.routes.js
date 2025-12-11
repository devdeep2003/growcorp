import { Router } from "express";
import { 
    GetPlansController, 
    BuyPlanController 
} from "../controllers/plans.controller.js";

const router = Router();

router.get("/", GetPlansController);
router.post("/buy", BuyPlanController);

export default router;
