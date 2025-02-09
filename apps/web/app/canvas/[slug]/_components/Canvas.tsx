import { IChat } from "@workspace/common/interfaces";

const Canvas = ({socket, messages}:{socket:WebSocket|null,messages:IChat[]}) => {
    if(!socket){
        return  <div>Connecting to server</div>
    }
    return (
        <div>
           <button onClick={()=>socket.send(JSON.stringify({type:"chat",message:"Hey there"}))}>send message</button>
           {messages?.map((msg:IChat,idx)=> <div key={idx}>{msg.message}</div>)}
        </div>
    );
}
 
export default Canvas;