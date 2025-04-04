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
  Highlighter,
  X,
  Sparkles,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { SelectedToolType } from "../Canvas"
import Image from "next/image"
import type { genAI } from "@workspace/common/shapes"
import { Button } from "@workspace/ui/components/button"
import axios from "axios"

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

  const promptRef = useRef<HTMLTextAreaElement | null>(null);

  const chooseTool = (type: SelectedToolType) => {
    setActiveTool(type)
    window.dispatchEvent(new CustomEvent("toolChange", { detail: type }))
  }

  const generateAISvgPath = async () => {
    if (promptRef.current && genAiShape) {
      try {
        const res = await axios.post('http://localhost:8000/api/generateSvg', {
          shape: genAiShape,
          prompt: promptRef.current.value
        }, {
          headers: { 'Content-Type': 'application/json' }
        })
        const {svgPath } = res.data;
        window.dispatchEvent(new CustomEvent('renderSvg',{detail:svgPath}));
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
      {tools.map((tool) => {
        return (
          <div
            key={tool.type}
            onClick={() => chooseTool(tool.type)}
            className={`relative rounded-lg p-1.5 sm:p-2 md:p-3 hover:bg-black/10 group transition-colors duration-300 hover:scale-110 hover:cursor-pointer ${activeTool === tool.type ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "hover:bg-black/6"}`}
          >
            <tool.icon className="size-3 sm:size-4 md:size-5" strokeWidth={1.5} />
            <span
              className={`hidden md:block absolute bottom-0.5 right-[3px] text-[10px] font-medium transition-colors group-hover:text-black ${activeTool === tool.type ? "text-black" : "text-muted-foreground"}`}
            >
              {tool.shortcut}
            </span>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 -translate-y-3 px-2 py-1 text-xs opacity-0 font-medium text-black bg-white/90 rounded whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              {tool.name}
            </div>
          </div>
        )
      })}
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

      {isPromptOpen && (
        <div className="absolute -right-20 top-16 w-80 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-100 overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-5">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-blue-600" />
                <h3 className="font-medium text-zinc-800">AI Illustration Generator</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                onClick={() => setIsPromptOpen(false)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <div className="relative">
              <textarea
                ref={promptRef}
                name="prompt"
                id="prompt"
                maxLength={100}
                placeholder="Describe the illustration you want to generate..."
                className="resize-none w-full h-28 p-3 text-sm rounded border border-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
              <div className="absolute bottom-2 right-2 text-xs text-zinc-400">0/280</div>
            </div>

            <Button
              onClick={generateAISvgPath}
              variant="default"
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded transition-all duration-300 shadow-sm hover:shadow"
            >
              <span className="flex items-center gap-2">
                Generate Illustration
                <Sparkles className="size-3.5" />
              </span>
            </Button>

            <div className="flex flex-col justify-start gap-2 text-xs bg-blue-50 p-3 rounded">
              <div className="font-medium text-zinc-700">Tips:</div>
              <ul className="list-disc list-inside text-zinc-600 space-y-1">
                <li>Be specific about color, shapes and styles</li>
                <li>Keep descriptions concise but detailed</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainToolbar

