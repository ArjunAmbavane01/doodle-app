import { verify } from "jsonwebtoken";
import { WebSocketServer,WebSocket } from "ws";
import {JWT_SECRET} from "@workspace/backend-common/config"

const wss = new WebSocketServer({ port: 8080 },()=> console.log(`Listening on port 8080`));
const checkUser = (token:string|null) => {
    try{
        if(!token) return null;
        const payload = verify(token,JWT_SECRET as string);
        if (!payload || typeof payload === 'string') return null;
        return payload.userId;
    }catch(e){
        console.log(e)
        return null
    }
}

wss.on('connection',(ws:WebSocket,req)=>{
    const reqURL = req.url;
    if(!reqURL) return;
    const params = new URLSearchParams(reqURL.split('?')[1]);
    const token = params.get('token');
    const userId = checkUser(token);
    if(!userId){
        ws.close();
        return;
    }
    ws.on('message',async (data)=>{
        try{
            const parsedData = JSON.parse(data as unknown as string);
        } catch(e){
            return null;
        }
    })
})