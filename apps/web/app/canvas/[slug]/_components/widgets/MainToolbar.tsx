"use client"

import { Circle, Hand, Minus, MousePointer, MoveRight, Pen, Square, Triangle, TypeIcon as TypeOutline, Highlighter } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { SelectedToolType } from "../Canvas"
import Image from "next/image"
import type { genAI } from "@workspace/common/shapes"
import axios from "axios"
import PromptPanel from "./MainToolbar/PromptPanel"
import ToolButton from "./MainToolbar/ToolButton"

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

const MainToolbar = () => {

  const [activeTool, setActiveTool] = useState<SelectedToolType>("pen")
  const [genAiShape, setgenAiShape] = useState<genAI | null>(null)
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false)
  const [isAIDrawingLoading,setIsAIDrawingLoading] = useState<boolean>(false);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const chooseTool = (type: SelectedToolType) => {
    setActiveTool(type)
    window.dispatchEvent(new CustomEvent("toolChange", { detail: type }))
  }

  const generateAISvgPath = async () => {
    if (promptRef.current && genAiShape) {
      try {
        setIsAIDrawingLoading((c)=>!c);
        const res = await axios.post('http://localhost:8000/api/generateSvg', {
          shape: genAiShape,
          prompt: promptRef.current.value
        }, {
          headers: { 'Content-Type': 'application/json' }
        })
        const {svgPath } = res.data;
        window.dispatchEvent(new CustomEvent('renderSvg',{detail:svgPath}));
        setIsAIDrawingLoading((c)=>!c);
        promptRef.current.value = '';
      } catch (e){
        console.error(e);
      }
    }
  }

  useEffect(() => {
    const handleToolChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setActiveTool(customEvent.detail)
      }
    }

    const handleOpenPrompt = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setgenAiShape(customEvent.detail)
        setIsPromptOpen((c) => !c)
      }
    }

    window.addEventListener("toolChangeFromKeyboard", handleToolChange)
    window.addEventListener("openPrompt", handleOpenPrompt)

    return () => {
      window.removeEventListener("toolChangeFromKeyboard", handleToolChange)
      window.removeEventListener("openPrompt", handleOpenPrompt)
    }
  }, [])

  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 mx-auto w-fit p-1 sm:p-1.5 px-1.5 sm:px-3 md:px-5 rounded-lg md:rounded-xl bg-white inset-x-0 top-4 sm:top-6 relative">
      {tools.map((tool) => <ToolButton key={tool.type} tool={tool} activeTool={activeTool} chooseTool={chooseTool} />)}
      <div className="w-[0.5px] bg-blue-200 h-10" />

      <div
        key={"genAI"}
        onClick={() => chooseTool("genAI")}
        className={`relative rounded-lg p-1.5 sm:p-2 md:p-3 hover:bg-black/10 group transition-colors duration-300 hover:scale-110 hover:cursor-pointer ${activeTool === "genAI" ? "bg-blue-100 hover:bg-blue-100" : "hover:bg-black/6"}`}
      >
        <Image src={"/images/chatbot.png"} alt="Chatbot" width={100} height={100} className="size-4 md:size-5" />
        <span
          className={`hidden md:block absolute bottom-0.5 right-[3px] text-[10px] font-medium transition-colors group-hover:text-black ${activeTool === "genAI" ? "text-black" : "text-muted-foreground"}`}
        >
          D
        </span>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 -translate-y-3 px-2 py-1 text-xs opacity-0 font-medium text-black bg-white/90 rounded whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          AI Prompt
        </div>
      </div>

      {isPromptOpen && <PromptPanel promptRef={promptRef} setIsPromptOpen={setIsPromptOpen} generateAISvgPath={generateAISvgPath} isAIDrawingLoading={isAIDrawingLoading}  />}
    </div>
  )
}

export default MainToolbar

