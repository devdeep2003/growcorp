import { Router } from "express";
import { 
    GetWalletController, 
    DepositController, 
    WithdrawController 
} from "../controllers/wallet.controller.js";

const router = Router();

router.get("/:userId", GetWalletController);
router.post("/deposit", DepositController);
router.post("/withdraw", WithdrawController);

export default router;
