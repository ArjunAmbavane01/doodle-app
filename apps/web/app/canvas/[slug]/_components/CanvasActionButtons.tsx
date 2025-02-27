'use client';
import { Minus, Plus, Redo2, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

const CanvasActionButtons = () => {
    const [zoomLevel, setZoomLevel] = useState(100);
    const dispatchEvent = (type: 'zoomOut' | 'zoomIn' | 'zoomReset' | 'redo' | 'undo') => {
        if (type === 'redo' || type === 'undo') window.dispatchEvent(new CustomEvent<string>(type, { detail: type }))
        if (type === 'zoomOut' || type === 'zoomIn' || type === 'zoomReset') window.dispatchEvent(new CustomEvent<string>(type))
    };
    useEffect(() => {
        const handleZoomChange = (e: CustomEvent<{ zoomLevel: number }>) => setZoomLevel(e.detail.zoomLevel);
        window.addEventListener('zoomLevelChange', handleZoomChange as EventListener);
        return () => window.removeEventListener('zoomLevelChange', handleZoomChange as EventListener);
    }, []);
    return (
        <div className="flex gap-5 absolute bottom-8 left-8">
            <div className="flex bg-white rounded-lg">
                <button className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-l-lg disabled:opacity-50"
                    disabled={zoomLevel <= 10}
                    onClick={() => { dispatchEvent("zoomOut") }}>
                    <Minus className="size-4" />
                </button>
                <div className="flex justify-center items-center px-1 -translate-y-[1px] text-sm font-medium tracking-tight hover:cursor-pointer"
                onClick={()=>{
                    setZoomLevel(100);
                    dispatchEvent("zoomReset");
                }}>
                    {zoomLevel} %
                </div>
                <button className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-r-lg disabled:opacity-50"
                    disabled={zoomLevel >= 1000}
                    onClick={() => { dispatchEvent("zoomIn") }}>
                    <Plus className="size-4" />
                </button>
            </div>
            <div className="flex bg-white rounded-lg">
                <button onClick={() => dispatchEvent("undo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-l-lg">
                    <Undo2 className="size-4" />
                </button>
                <button onClick={() => dispatchEvent("redo")} className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-r-lg">
                    <Redo2 className="size-4" />
                </button>
            </div>
        </div>
    );
}

export default CanvasActionButtons;