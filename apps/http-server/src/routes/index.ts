import { Router } from "express";
import AuthController from "../controllers/AuthController";
import createRoom from "../controllers/RoomController";

const router:Router = Router()

router.post('/auth/login',AuthController.login)
router.post('/canvas/rooms',createRoom)

export default router;