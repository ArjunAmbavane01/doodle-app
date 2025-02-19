import { Redo2, Undo2 } from "lucide-react";

const CanvasActionButtons = () => {
    const dispatchEvent = (type:'redo'|'undo') => window.dispatchEvent(new CustomEvent<string>(type,{detail:type}));
    return ( 
        <div className="flex rounded-lg bg-white text-dark absolute bottom-8 left-8">
            <button onClick={() => dispatchEvent("undo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg">
                <Undo2 className="size-4" />
            </button>
            <button onClick={() => dispatchEvent("redo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg">
                <Redo2 className="size-4" />
            </button>
        </div>
     );
}
 
export default CanvasActionButtons;