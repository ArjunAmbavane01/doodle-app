"use client"

import { Circle, Hand, Minus, MousePointer, MoveRight, Pen, Square, Triangle, TypeIcon as TypeOutline,Highlighter } from "lucide-react"
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
  { icon: Highlighter, name: "Highlighter", shortcut: "M", type: "highlighter" },
] as const

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<SelectedToolType>("pen")

  const chooseTool = (type: SelectedToolType) => {
    setActiveTool(type)
    window.dispatchEvent(new CustomEvent("toolChange", { detail: type }))
  }

  useEffect(() => {
    const handleToolChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setActiveTool(customEvent.detail);
      }
    }
    window.addEventListener('toolChangeFromKeyboard', handleToolChange);

    return () => window.removeEventListener('toolChangeFromKeyboard', handleToolChange);
  }, [])

  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mx-auto w-fit p-1 sm:p-1.5 px-1.5 sm:px-3 md:px-5 rounded-lg md:rounded-xl bg-white fixed inset-x-0 top-4 sm:top-6">
        {tools.map((tool) => {
          return (
            <div key={tool.type} onClick={() => chooseTool(tool.type)} className={`relative rounded-lg p-1.5 sm:p-2 md:p-3 hover:bg-black/10 group transition-colors duration-300 hover:scale-110 hover:cursor-pointer ${activeTool === tool.type ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "hover:bg-black/10"}`}>
                <tool.icon className="size-3 sm:size-4 md:size-5" strokeWidth={1.5} />
                <span className={`hidden md:block absolute bottom-0.5 right-[3px] text-[10px] font-medium transition-colors group-hover:text-black ${activeTool === tool.type ? 'text-black' : 'text-muted-foreground'}`}>
                  {tool.shortcut}
                </span>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 -translate-y-3 px-2 py-1 text-xs opacity-0 font-medium text-black bg-white/90 rounded whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {tool.name}
                </div>
            </div>
          )
        })}
    </div>
  )
}

