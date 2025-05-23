"use client"

import { useEffect, useRef, useState } from "react"
import axios from "axios"
import Image from "next/image"
import { CREATE_SVG_URL } from "@/lib/apiEndPoints"
import type { SelectedToolType } from "../../Canvas"
import type { genAI } from "@workspace/common/shapes"
import PromptPanel from "./PromptPanel"
import ToolButton from "./ToolButton"
import { Circle, Hand, Minus, MousePointer, MoveRight, Pen, Square, Triangle, TypeIcon as TypeOutline, Highlighter } from "lucide-react"

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

const MainToolbar = ({ selectTool }: { selectTool: ((tool: SelectedToolType) => void) }) => {

  const [activeTool, setActiveTool] = useState<SelectedToolType>("pen")
  const [genAIShape, setgenAIShape] = useState<genAI | null>(null)
  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(false)
  const [isAIDrawingLoading, setIsAIDrawingLoading] = useState<boolean>(false);

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const chooseTool = (type: SelectedToolType) => {
    setActiveTool(type)
    selectTool(type);
  }

  const generateAISvgPath = async () => {
    if (promptRef.current && genAIShape) {
      try {
        setIsAIDrawingLoading((c) => !c);
        const res = await axios.post(CREATE_SVG_URL, {
          shape: genAIShape,
          prompt: promptRef.current.value
        }, {
          headers: { 'Content-Type': 'application/json' }
        })
        const { svgPath } = res.data;
        window.dispatchEvent(new CustomEvent('renderSvg', { detail: svgPath }));
        setIsAIDrawingLoading((c) => !c);
        if(promptRef.current) promptRef.current.value = '';
      } catch (e) {
        console.error(e);
      }
    }
  }

  useEffect(() => {
    const handleToolChange = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) setActiveTool(customEvent.detail)
    }

    const handleOpenPrompt = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setgenAIShape(customEvent.detail)
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
    <div className="flex items-center gap-0 sm:gap-0.5 md:gap-1.5 top-2 sm:top-4 mx-auto left-0 right-0 w-fit max-w-[90%] sm:max-w-none p-1 px-1 sm:p-1.5 sm:px-3 rounded-lg md:rounded-xl bg-white absolute sm:relative ">
      {tools.map((tool) => <ToolButton key={tool.type} tool={tool} activeTool={activeTool} chooseTool={chooseTool} />)}

      <div className="mx-[2px] w-[0.5px] bg-blue-200 self-stretch" />

      <div
        key={"genAI"}
        onClick={() => chooseTool("genAI")}
        className={`relative rounded-lg p-1.5 sm:p-2 md:p-2.5 hover:bg-black/10 font-heading group transition-colors duration-300 hover:scale-110 hover:cursor-pointer ${activeTool === "genAI" ? "bg-blue-100 hover:bg-blue-100" : "hover:bg-black/6"}`}
      >
        <Image src={"/images/chatbot.png"} alt="Chatbot" width={100} height={100} className="size-4 md:size-5" />
        <span
          className={`hidden md:block absolute -bottom-[1px] right-[3px] text-[10px] font-medium transition-colors group-hover:text-black ${activeTool === "genAI" ? "text-black" : "text-muted-foreground"}`}
        >
          D
        </span>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 -translate-y-3 px-2 py-1 text-xs opacity-0 font-medium text-black bg-white/90 rounded whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          AI Prompt
        </div>
      </div>

      {isPromptOpen && <PromptPanel promptRef={promptRef} setIsPromptOpen={setIsPromptOpen} generateAISvgPath={generateAISvgPath} isAIDrawingLoading={isAIDrawingLoading} />}
    </div>
  )
}

export default MainToolbar

