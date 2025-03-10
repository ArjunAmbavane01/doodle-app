import { Router } from "express";
import {createRoom,joinRoom} from "../controllers/RoomController";
import { auth } from "../auth";
import { login } from "../controllers/AuthController";

const router:Router = Router()

router.post('/auth/login',login)
router.post('/rooms/createRoom',auth ,createRoom)
router.post('/rooms/joinRoom',auth, joinRoom)

export default router;