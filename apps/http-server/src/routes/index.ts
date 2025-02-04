import { Router } from "express";
import AuthController from "../controllers/AuthController";
import {createRoom,joinRoom} from "../controllers/RoomController";
import { auth } from "../auth";

const router:Router = Router()

router.post('/auth/login',AuthController.login)
router.post('/rooms/createRoom',auth ,createRoom)
router.post('/rooms/joinRoom',auth, joinRoom)

export default router;