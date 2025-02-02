import { verify } from "jsonwebtoken";
import { WebSocketServer } from "ws";
import {JWT_SECRET} from '@workspace/backend-common/config';

const wss = new WebSocketServer({port:8080});

const checkUser = (token:string|null)=>{
    if(!token) return null;
    const payload = verify(token,JWT_SECRET as string);
    if(!payload || typeof payload === 'string') return;
    return payload.user.id;
}

wss.on('connection',(ws,req)=>{
    const reqURL = req.url;
    if(!reqURL) return;
    const params = new URLSearchParams(reqURL.split('?')[1]);
    const token = params.get('token');
    const userId = checkUser(token);
    if(!userId) return;
    ws.on('message',(data)=>{
        console.log(data.toString());
    })
})      