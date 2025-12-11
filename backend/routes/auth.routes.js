import { Router } from "express";
import { LoginController, RegisterController, SubmitKYCController, GetReferralsController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login" , LoginController);
router.post("/register" , RegisterController);
router.post("/kyc", SubmitKYCController);
router.get("/referrals/:code", GetReferralsController);

export default router;