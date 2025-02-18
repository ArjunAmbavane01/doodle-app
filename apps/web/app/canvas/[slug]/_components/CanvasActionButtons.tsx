import { ChevronLeft, ChevronRight } from "lucide-react";

const CanvasActionButtons = () => {
    const dispatchEvent = (type:'redo'|'undo') => window.dispatchEvent(new CustomEvent<string>(type,{detail:type}));
    return ( 
        <div className="flex rounded-lg bg-white text-dark absolute bottom-8 left-8">
            <button onClick={() => dispatchEvent("undo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg">
                <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => dispatchEvent("redo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-lg">
                <ChevronRight className="size-5" />
            </button>
        </div>
     );
}
 
export default CanvasActionButtons;