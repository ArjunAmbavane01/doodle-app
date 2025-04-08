"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react";
import ColorTab from './ColorTab';
import TextTab from "./TextTab";
import PenTab from "./PenTab";
import { Menu, Palette, Pen, Type, X } from "lucide-react";

type TabType = "color" | "text" | "pen"

export interface IColourGroup {
  name: string,
  colors: string[];
}

export const colorGroups: IColourGroup[] = [
  {
    name: "Basic",
    colors: ["#ffffff", "#aaaaaa", "#555555", "#000000"],
  },
  {
    name: "Vibrant",
    colors: ["#ff5555", "#ffaa00", "#ffff00", "#55ff55", "#00aaff", "#aa55ff"],
  },
  {
    name: "Pastel",
    colors: ["#ffcccc", "#ffeedd", "#ffffcc", "#ccffcc", "#ccddff", "#eeccff"],
  },
]

export function isLightColor(color: string): boolean {
  return color === "#ffffff" || color === "#ffff00" || color === "#ffffcc"
}

interface StyleToolbarProps {
  selectStrokeColour: (strokeColor: string) => void,
  selectFillColour: (bgColor: string) => void,
  selectFontFamily: (fontFamily: string) => void,
  selectFontSize: (fontSize: number) => void,
  selectTextColor: (textColor: string) => void,
  selectTextStyle: (textStyle: { bold: boolean, italic: boolean }) => void,
  selectPenWidth: (penWidth: number) => void
}

const StyleToolbar = ({ selectStrokeColour, selectFillColour, selectFontFamily, selectFontSize, selectTextColor, selectTextStyle, selectPenWidth }: StyleToolbarProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("color");
  const [strokeColor, setStrokeColor] = useState("#ffffff");

  const toggleMenu = () => {
    setMenuExpanded(!menuExpanded)
    if (menuExpanded) setIsOpen(false)
  }

  const handleToolClick = (tab: TabType) => {
    setActiveTab(tab)
    setIsOpen(true)
  }

  return (
    <div className="fixed bottom-7 sm:bottom-auto sm:top-5 left-5 z-10 font-heading">
      <motion.div className="flex flex-col gap-3 p-1.5 sm:p-2 rounded-lg bg-white/15" initial={{ width: "auto" }} animate={{ width: "auto" }}>
        <motion.button className="flex items-center justify-center size-6 sm:size-8 rounded bg-neutral-600 border border-neutral-700 shadow-lg hover:bg-neutral-600 transition-colors" aria-label="Open color menu" whileTap={{ scale: 0.95 }} onClick={toggleMenu}>
          <Menu className="size-3 sm:size-4 text-white" />
        </motion.button>

        <AnimatePresence>
          {menuExpanded && (
            <>
              <motion.button
                className="flex items-center justify-center size-6 sm:size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => handleToolClick("color")}
                aria-label="Open color menu"
              >
                <Palette className="size-3 sm:size-4 text-white" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleToolClick("text")}
                className="flex items-center justify-center size-6 sm:size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
                aria-label="Open text menu"
              >
                <Type className="size-3 sm:size-4 text-white" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => handleToolClick("pen")}
                className="flex items-center justify-center size-6 sm:size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
                aria-label="Open pen menu"
              >
                <Pen className="size-3 sm:size-4 text-white" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="absolute top-0 left-14 bg-neutral-800 rounded-lg border border-neutral-700 shadow-xl w-64 overflow-hidden"
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="flex justify-between items-center p-3 border-neutral-700">
              <div className="flex items-center gap-3 text-white">
                {activeTab === "color" && <Palette className="size-4" />}
                {activeTab === "text" && <Type className="size-4" />}
                {activeTab === "pen" && <Pen className="size-4" />}
                <h3 className="font-sm">
                  {activeTab === "color" && "Color Palette"}
                  {activeTab === "text" && "Text Options"}
                  {activeTab === "pen" && "Pen Options"}
                </h3>
              </div>
              <button className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-700" onClick={() => setIsOpen(false)}
                aria-label="Close menu">
                <X className="size-3" />
              </button>
            </div>

            {activeTab === "color" && <ColorTab strokeColor={strokeColor} setStrokeColor={setStrokeColor} selectStrokeColour={selectStrokeColour} selectFillColour={selectFillColour} />}

            {activeTab === "text" && <TextTab selectFontFamily={selectFontFamily} selectFontSize={selectFontSize} selectTextColor={selectTextColor} selectTextStyle={selectTextStyle} />}

            {activeTab === "pen" && <PenTab strokeColor={strokeColor} setStrokeColor={setStrokeColor} selectStrokeColour={selectStrokeColour} selectPenWidth={selectPenWidth} />}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default StyleToolbar;