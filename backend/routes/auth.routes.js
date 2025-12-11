import { Router } from "express";
import { LoginController, RegisterController, SubmitKYCController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login" , LoginController);
router.post("/register" , RegisterController);
router.post("/kyc", SubmitKYCController);

export default router;