import express from "express";
import { 
    LoginController, 
    RegisterController 
} from "../controllers/auth.controller.js";
import { 
    GetWalletController, 
    DepositController, 
    WithdrawController, 
    GetTransactionsController 
} from "../controllers/wallet.controller.js";
import { 
    GetPlansController, 
    BuyPlanController 
} from "../controllers/plans.controller.js";
import {
    GetUserTradesController
} from "../controllers/trade.controller.js";

const router = express.Router();

// Auth
router.post("/auth/login", LoginController);
router.post("/auth/register", RegisterController);

// Wallet
router.get("/wallet/:userId", GetWalletController);
router.post("/wallet/deposit", DepositController);
router.post("/wallet/withdraw", WithdrawController);
router.get("/transactions/:userId", GetTransactionsController);

// Plans
router.get("/plans", GetPlansController);
router.post("/plans/buy", BuyPlanController);

// Trades
router.get("/trades/:userId", GetUserTradesController);

export default router;
