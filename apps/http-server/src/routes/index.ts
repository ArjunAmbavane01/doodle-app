import { Router } from "express";
import { auth } from "../auth";
import {createRoom,joinRoom} from "../controllers/RoomController";
import { login } from "../controllers/AuthController";
import { generateSvg } from "../controllers/CanvasContoller";

const router:Router = Router()

router.post('/auth/login',login)
router.post('/rooms/createRoom',auth ,createRoom)
router.post('/rooms/joinRoom',auth, joinRoom)

// router.post('/generateSvg', generateSvg)
router.post('/generateSvg',auth, generateSvg)

export default router;