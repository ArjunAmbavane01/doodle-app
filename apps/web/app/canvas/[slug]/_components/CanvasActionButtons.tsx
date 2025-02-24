'use client';
import { Minus, Plus, Redo2, Undo2 } from "lucide-react";
import { useState } from "react";

const CanvasActionButtons = () => {
    const [zoom,setZoom] = useState(1);
    const dispatchEvent = (type:'zoomOut'|'zoomIn'|'redo'|'undo') => {
        if(type==='redo' || type==='undo') window.dispatchEvent(new CustomEvent<string>(type,{detail:type}))
        if(type==='zoomOut' || type==='zoomIn') window.dispatchEvent(new CustomEvent<string>(type,{detail:zoom.toString()}))
        
    };
    return ( 
        <div className="flex gap-5 absolute bottom-8 left-8">
            <div className="flex bg-white rounded-lg">
            <button className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg"
            onClick={() => {
                dispatchEvent("zoomOut");
                setZoom((z)=>z*0.9)
            }} >
                <Minus className="size-4" />
            </button>
            <button className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg"
            onClick={() =>{
                dispatchEvent("zoomIn");
                setZoom((z)=>z*1.1)
            }}>
                <Plus className="size-4" />
            </button>
            </div>
            <div className="flex bg-white rounded-lg">
            <button onClick={() => dispatchEvent("undo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg">
                <Undo2 className="size-4" />
            </button>
            <button onClick={() => dispatchEvent("redo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg">
                <Redo2 className="size-4" />
            </button>
            </div>
        </div>
     );
}
 
export default CanvasActionButtons;