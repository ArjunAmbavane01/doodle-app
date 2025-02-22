"use client"

import {
  Circle,
  Hand,
  Minus,
  MousePointer,
  MoveRight,
  Pen,
  Square,
  Triangle,
  TypeIcon as TypeOutline,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@workspace/ui/components/tooltip"
import { useEffect, useState } from "react"
import { SelectedToolType } from "./Canvas"

const tools = [
  { icon: Hand, name: "Pan", shortcut: "H", type: "pan" },
  { icon: MousePointer, name: "Selection", shortcut: "S", type: "selection" },
  { icon: Square, name: "Rectangle", shortcut: "R", type: "rectangle" },
  { icon: Circle, name: "Circle", shortcut: "C", type: "circle" },
  { icon: Triangle, name: "Triangle", shortcut: "T", type: "triangle" },
  { icon: Pen, name: "Pen", shortcut: "P", type: "pen" },
  { icon: Minus, name: "Line", shortcut: "L", type: "line" },
  { icon: MoveRight, name: "Arrow", shortcut: "A", type: "arrow" },
  { icon: TypeOutline, name: "Text", shortcut: "W", type: "text" },
] as const


export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<SelectedToolType>("pen")

  const chooseTool = (type: SelectedToolType) => {
    setActiveTool(type)
    window.dispatchEvent(new CustomEvent("toolChange", { detail: type }))
  }

  useEffect(()=>{
    const handleToolChange = (e:Event) => {
        const customEvent = e as CustomEvent;
        if (customEvent.detail) {
            setActiveTool(customEvent.detail);
        }
    }
    window.addEventListener('toolChangeFromKeyboard',handleToolChange);

    return () => window.removeEventListener('toolChangeFromKeyboard',handleToolChange);
  },[])

  return (
    <TooltipProvider delayDuration={300}>
      <div className="fixed inset-x-0 top-8 mx-auto w-fit">
        <div className="flex items-center gap-5 rounded-lg bg-background p-1.5 shadow-lg ring-1 ring-border/10">
          {tools.map((tool) => (
            <Tooltip key={tool.type}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => chooseTool(tool.type)}
                  className={`group relative rounded-md p-2.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground
                    ${activeTool === tool.type ? 'bg-accent text-accent-foreground' : ''} `}>
                  <tool.icon className="size-4" />
                  <span className={`absolute bottom-0.5 right-0.5 text-[10px] font-medium transition-colors group-hover:text-accent-foreground ${activeTool === tool.type ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                    {tool.shortcut}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="font-medium">
                {tool.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  )
}

