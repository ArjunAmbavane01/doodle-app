'use client';

import { useEffect, useState } from "react";
import { Minus, Plus, Redo2, Undo2 } from "lucide-react";

interface QuickActionsProps {
    handleZoomIn: () => void,
    handleZoomOut: () => void,
    handleZoomReset: () => void,
    handleRedo: () => void,
    handleUndo: () => void,

}
const QuickActions = ({ handleZoomIn, handleZoomOut, handleZoomReset, handleUndo, handleRedo }: QuickActionsProps) => {

    const [zoomLevel, setZoomLevel] = useState(100);

    const handleEvent = (type: 'zoomOut' | 'zoomIn' | 'zoomReset' | 'redo' | 'undo') => {
        if(type === "undo") handleUndo();
        if(type === "redo") handleRedo();
        if(type === "zoomIn") handleZoomIn();
        if(type === "zoomOut") handleZoomOut();
        if(type === "zoomReset") handleZoomReset();
    };

    useEffect(() => {
        const handleZoomChange = (e: CustomEvent<{ zoomLevel: number }>) => setZoomLevel(e.detail.zoomLevel);
        window.addEventListener('zoomLevelChange', handleZoomChange as EventListener);
        return () => window.removeEventListener('zoomLevelChange', handleZoomChange as EventListener);
    }, []);

    return (
        <div className="flex gap-5 fixed bottom-7 right-8 sm:right-auto sm:left-5 text-zinc-800">
            <div className="hidden sm:flex bg-white rounded-lg cursor-pointer">
                <button className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-l-lg disabled:opacity-50"
                    disabled={zoomLevel <= 10}
                    onClick={() => { handleEvent("zoomOut") }}>
                    <Minus className="size-4" />
                </button>
                <div className="flex justify-center items-center px-1 text-sm font-medium tracking-tight group relative"
                    onClick={() => { handleEvent("zoomReset") }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 -translate-y-3 px-2 py-1 text-xs opacity-0 font-medium text-black bg-white rounded whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        Reset Zoom
                    </div>
                    {zoomLevel} %
                </div>
                <button className="flex justify-center items-center p-3 hover:bg-gray-200 rounded-r-lg disabled:opacity-50"
                    disabled={zoomLevel >= 1000}
                    onClick={() => { handleEvent("zoomIn") }}>
                    <Plus className="size-4" />
                </button>
            </div>
            <div className="flex bg-white rounded-lg">
                <button onClick={() => handleEvent("undo")} className="flex justify-center items-center p-2.5 hover:bg-gray-200 rounded-l-lg">
                    <Undo2 className="size-2.5 md:size-4" />
                </button>
                <button onClick={() => handleEvent("redo")} className="flex justify-center items-center p-2.5 hover:bg-gray-200 rounded-r-lg">
                    <Redo2 className="size-2.5 md:size-4" />
                </button>
            </div>
        </div>
    );
}

export default QuickActions;