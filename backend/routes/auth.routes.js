import { Router } from "express";
import { LoginController, RegisterController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login" , LoginController);
router.post("/register" , RegisterController);

export default router;