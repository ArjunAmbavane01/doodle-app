"use client"

import { Circle, Hand, Minus, MousePointer, MoveRight, Pen, Square, Triangle, TypeIcon as TypeOutline} from "lucide-react"
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
  { icon: TypeOutline, name: "Text", shortcut: "T", type: "text" },
] as const

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<SelectedToolType>("selection")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
    <div className="fixed inset-x-0 top-8 mx-auto w-fit">
      <div className="flex items-end gap-5 rounded-2xl p-2 px-4 shadow-lg bg-white">
        {tools.map((tool, index) => {
          const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - index) : 0
          return (
            <motion.div key={tool.type} className="relative"
              animate={{ y: hoveredIndex === index ? -5 : 0}}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25,}}>
              <motion.div
                className="absolute -inset-[2px] rounded-lg bg-black/10 opacity-0"
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  scale: hoveredIndex === index ? 1 : 0.8,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              />
              <button
                onClick={() => chooseTool(tool.type)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative rounded-lg p-2.5 outline-none transition-colors duration-200 ${activeTool === tool.type && !hoveredIndex && "bg-accent text-accent-foreground"} `}>
                <tool.icon className="size-5" strokeWidth={1.5} />
                <span className={`absolute bottom-0.5 right-0.5 text-[10px] font-medium transition-colors group-hover:text-accent-foreground ${activeTool === tool.type ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                    {tool.shortcut}
                  </span>
                <motion.div
                  className="absolute -bottom-8 left-1/2 whitespace-nowrap rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm"
                  initial={{ opacity: 0, y: -10, x: "-50%" }}
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                    y: hoveredIndex === index ? 0 : -10,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  {tool.name}
                  {/* <span className="ml-1.5 text-muted-foreground">{tool.shortcut}</span> */}
                </motion.div>
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

