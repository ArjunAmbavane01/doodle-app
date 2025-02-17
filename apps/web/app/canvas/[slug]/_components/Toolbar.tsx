'use client'
import { Circle, Minus, MoveRight, Pen, Square, Triangle } from "lucide-react";
import { selectedTool } from "./Canvas";
import { Arrow } from "@radix-ui/react-dropdown-menu";

const Toolbar = () => {
    const chooseTool = (shape: selectedTool) => window.dispatchEvent(new CustomEvent<selectedTool>("toolChange", { detail: shape }));
    return (
        <div className="flex justify-center items-center gap-5 fixed inset-x-0 bottom-10 mx-auto bg-white rounded-lg p-1 w-[50%]">
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('triangle')}>
                <Triangle className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('rectangle')}>
                <Square className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('circle')}>
                <Circle className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('pen')}>
                <Pen className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('arrow')}>
                <MoveRight className="size-5" />
            </button>
            <button className="p-3 rounded hover:bg-gray-300" onClick={() => chooseTool('line')}>
                <Minus className="size-5" />
            </button>
        </div>
    );
}

export default Toolbar;