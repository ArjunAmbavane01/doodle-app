import { Router } from "express";
import AuthController from "../controllers/AuthController";

const router:Router = Router()

router.post('/auth/login',AuthController.login)

export default router;