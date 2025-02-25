"use client"

import { Circle, Hand, Minus, MousePointer, MoveRight, Pen, Square, Triangle, TypeIcon as TypeOutline } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
    <div className="flex items-end gap-5 mx-auto w-fit p-1.5 px-4 shadow-lg rounded-xl bg-white fixed inset-x-0 top-8">
        {tools.map((tool, index) => {
          return (
            <motion.div key={tool.type} className="relative rounded hover:bg-black/10 transition-colors duration-200" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <button onClick={() => chooseTool(tool.type)} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} className={`relative rounded-lg p-3 outline-none transition-colors duration-200 ${activeTool === tool.type && "bg-blue-100 text-blue-800"} `}>
                <tool.icon className="size-5" strokeWidth={1.5} />
                <span className={`absolute bottom-0.5 right-0.5 text-[10px] font-medium transition-colors group-hover:text-accent-foreground ${activeTool === tool.type ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                  {tool.shortcut}
                </span>
                <motion.div className="absolute -bottom-8 left-1/2 whitespace-nowrap rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm"
                  initial={{ opacity: 0, y: -10, x: "-50%" }} animate={{ opacity: hoveredIndex === index ? 1 : 0, y: hoveredIndex === index ? 0 : -10, }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, }}
                >
                  {tool.name}
                </motion.div>
              </button>
            </motion.div>
          )
        })}
    </div>
  )
}

