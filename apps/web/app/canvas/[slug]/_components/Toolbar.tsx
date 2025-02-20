'use client'
import { Circle, Hand, Minus, MousePointer, MoveRight, Pen, Square, Triangle, TypeOutline } from "lucide-react";
import { selectedToolType } from "./Canvas";

const Toolbar = () => {
    const chooseTool = (shape: selectedToolType) => window.dispatchEvent(new CustomEvent<selectedToolType>("toolChange", { detail: shape }));
    return (
        <div className="flex justify-center items-center gap-5 fixed inset-x-0 top-8 mx-auto p-1 bg-white rounded-lg w-[50%]">
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('pan')}>
                <Hand className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('selection')}>
                <MousePointer className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('rectangle')}>
                <Square className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('circle')}>
                <Circle className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('triangle')}>
                <Triangle className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('pen')}>
                <Pen className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('line')}>
                <Minus className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('arrow')}>
                <MoveRight className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('text')}>
                <TypeOutline className="size-5" />
            </button>
        </div>
    );
}

export default Toolbar;