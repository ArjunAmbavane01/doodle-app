"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

import { Paintbrush2, PaintBucket, Palette, X, Check, Pipette, CircleDashed, Type, Bold, Italic, Pen, Minus, Plus, Menu, } from "lucide-react"

type TabType = "color" | "text" | "pen"

interface IToolOption {
  name: string,
  value: string
}

interface IColourGroup {
  name: string,
  colors: string[];
}

const colorGroups: IColourGroup[] = [
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

const fontFamilies: IToolOption[] = [
  { name: "Handwritten", value: "Caveat, Comic Sans MS, cursive" },
  { name: "Sans Serif", value: "Arial, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Elegant", value: "Garamond, Times New Roman, serif" },
]


const ExtendedToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("color");
  const [colorSubTab, setColorSubTab] = useState<"stroke" | "bg">("stroke");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("transparent");
  const [recentColors, setRecentColors] = useState<string[]>([]);

  // Text options
  const [fontFamily, setFontFamily] = useState((fontFamilies[0] as IToolOption).value);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false });

  // Pen options
  const [penWidth, setPenWidth] = useState(2)

  const handleColorClick = (color: string) => {
    if (colorSubTab === "stroke") {
      setStrokeColor(color)
      window.dispatchEvent(new CustomEvent("strokeColourChange", { detail: color }))
      if (!recentColors.includes(color)) {
        setRecentColors((prev) => [color, ...prev.slice(0, 7)])
      }
    } else {
      setBgColor(color);
      window.dispatchEvent(new CustomEvent("bgColourChange", { detail: color }))
      if (color !== "transparent" && !recentColors.includes(color)) {
        setRecentColors((prev) => [color, ...prev.slice(0, 7)])
      }
    }
  }

  const handleFontFamilyClick = (fontFamily: string) => {
    setFontFamily(fontFamily);
    window.dispatchEvent(new CustomEvent("fontFamilyChange", { detail: fontFamily }));
  }

  const handleFontSizeClick = (type: "increase" | "decrease") => {
    const modifier = type === "increase" ? 1 : -1;
    const newSize = Math.min(72, Math.max(8, fontSize + modifier));
    setFontSize(newSize)
    window.dispatchEvent(new CustomEvent("fontSizeChange", { detail: newSize }));
  }

  const handleTextColorClick = (color: string) => {
    setTextColor(color);
    window.dispatchEvent(new CustomEvent("textColorChange", { detail: color }));
  }

  const handlePenColorClick = (color: string) => {
    setStrokeColor(color)
    window.dispatchEvent(new CustomEvent("strokeColourChange", { detail: color }))
  }

  const toggleTextStyle = (style: keyof typeof textStyle) => { 
    const updatedTextStyle = {...textStyle, [style]: !textStyle[style],};
    setTextStyle(updatedTextStyle);
    window.dispatchEvent(new CustomEvent("textStyleChange", {detail : updatedTextStyle}));
  }

  const handlePenWidthClick = (type: "increase" | "decrease") => {
    const modifier = type === "increase" ? 1 : -1;
    const newSize = Math.min(20, Math.max(1, penWidth + modifier));
    setPenWidth(newSize)
    window.dispatchEvent(new CustomEvent("penWidthChange", { detail: newSize }));
  }

  const toggleMenu = () => {
    setMenuExpanded(!menuExpanded)
    if (menuExpanded) setIsOpen(false)
  }

  const handleToolClick = (tab: TabType) => {
    setActiveTab(tab)
    setIsOpen(true)
  }

  return (
    <div className="absolute top-7 left-5 z-10 font-heading">
      <motion.div className="flex flex-col gap-3 p-2 rounded-lg bg-white/15" initial={{ width: "auto" }} animate={{ width: "auto" }}>
        <motion.button className="flex items-center justify-center size-8 rounded bg-neutral-600 border border-neutral-700 shadow-lg hover:bg-neutral-600 transition-colors" aria-label="Open color menu" whileTap={{ scale: 0.95 }} onClick={toggleMenu}>
          <Menu className="size-4 text-white" />
        </motion.button>

        <AnimatePresence>
          {menuExpanded && (
            <>
              <motion.button
                className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => handleToolClick("color")}
                aria-label="Open color menu"
              >
                <Palette className="size-4 text-white" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => handleToolClick("text")}
                className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
                aria-label="Open text menu"
              >
                <Type className="size-4 text-white" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15 }}
                onClick={() => handleToolClick("pen")}
                className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
                aria-label="Open pen menu"
              >
                <Pen className="size-4 text-white" />
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

            {/* Color Tab Content */}
            {activeTab === "color" && (
              <>
                <div className="flex border-b text-white border-neutral-700">
                  <button className={`flex items-center justify-center flex-1 p-2 gap-2 ${colorSubTab === "stroke" ? "bg-neutral-700" : "hover:bg-neutral-700/50"}`}
                    onClick={() => setColorSubTab("stroke")}
                  >
                    <Paintbrush2 className="size-3" />
                    <span className="text-sm">Stroke</span>
                  </button>
                  <button className={`flex items-center justify-center flex-1 p-2 gap-2 ${colorSubTab === "bg" ? "bg-neutral-700" : "hover:bg-neutral-700/50"}`}
                    onClick={() => setColorSubTab("bg")}
                  >
                    <PaintBucket className="size-3" />
                    <span className="text-sm">Fill</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3 p-3 max-h-80 overflow-y-auto">
                  {recentColors.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-neutral-200">
                        <Pipette className="size-3" />
                        <h4 className="text-xs">Recent</h4>
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {recentColors.map((color) => (
                          <button key={color} className="grid place-items-center size-6 rounded-sm hover:scale-110 transition-transform duration-75 ease-out"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorClick(color)} aria-label={`Select color ${color}`}>
                            {((colorSubTab === "stroke" && strokeColor === color) ||
                              (colorSubTab === "bg" && bgColor === color)) && (
                                <Check className="size-3 text-black stroke-2" style={{ filter: isLightColor(color) ? "none" : "invert(1)" }} />
                              )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {colorGroups.map((group) => (
                      <div key={group.name} className="flex flex-col gap-2">
                        <h4 className="text-xs text-neutral-200">{group.name}</h4>
                        <div className="grid grid-cols-8 gap-1">
                          {group.colors.map((color) => (
                            <motion.button
                              key={color}
                              className="grid place-items-center size-6 rounded-sm hover:scale-110 transition-transform duration-75 ease-out"
                              style={{ backgroundColor: color }}
                              onClick={() => handleColorClick(color)}
                              whileTap={{ scale: 0.95 }}
                              aria-label={`Select color ${color}`}
                            >
                              {((colorSubTab === "stroke" && strokeColor === color) || (colorSubTab === "bg" && bgColor === color)) && (
                                <Check className="size-3 text-black stroke-2" style={{ filter: isLightColor(color) ? "none" : "invert(1)" }} />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {colorSubTab === "bg" && (
                    <button className="flex items-center gap-2 text-sm text-white hover:bg-neutral-700 p-2 rounded w-full transition-colors duration-200"
                      onClick={() => handleColorClick("transparent")}
                    >
                      <CircleDashed className="size-3" />
                      Transparent {bgColor === "transparent" && <Check className="ml-auto size-3 text-white" />}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-around p-3 text-xs text-white border-t border-neutral-700">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-sm border border-white" style={{ backgroundColor: strokeColor }} />
                    Stroke
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="size-6 rounded-sm border border-white"
                      style={{
                        backgroundColor: bgColor === "transparent" ? "transparent" : bgColor,
                        backgroundImage: bgColor === "transparent" ? "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px" : "none",
                      }}
                    />
                    Fill
                  </div>
                </div>
              </>
            )}

            {/* Text Tab Content */}
            {activeTab === "text" && (
              <div className="flex flex-col gap-3 p-3 min-h-80">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-200 block">Font Family</label>
                  <Select value={fontFamily} onValueChange={handleFontFamilyClick}>
                    <SelectTrigger className="p-2 rounded-sm text-sm w-full bg-neutral-700 border border-neutral-600 text-white focus:outline-none focus:ring-0" value={fontFamily}>
                      <SelectValue placeholder="Select Font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font.name} value={font.value} className="cursor-pointer">{font.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-200">Font Size</label>
                  <div className="flex items-center h-8">
                    <motion.button className="grid place-items-center h-full w-8 rounded-l-sm border bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFontSizeClick("decrease")}
                    >
                      <Minus className="size-3" />
                    </motion.button>
                    <div className="flex-1 h-full py-1 px-2 text-center text-white bg-neutral-700 border-t border-b border-neutral-600 ">
                      {fontSize}px
                    </div>
                    <motion.button className="grid place-items-center h-full w-8 rounded-r-sm border bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFontSizeClick("increase")}
                    >
                      <Plus className="size-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-200">Text Style</label>
                  <div className="flex border border-neutral-600 rounded-sm overflow-hidden text-white">
                    <button className={`flex-1 p-2 flex justify-center ${textStyle.bold ? "bg-neutral-400/80" : "bg-neutral-700 hover:bg-neutral-600"}`} onClick={() => toggleTextStyle("bold")}
                    >
                      <Bold className="size-4" />
                    </button>
                    <button className={`flex-1 p-2 flex justify-center ${textStyle.italic ? "bg-neutral-400/80" : "bg-neutral-700 hover:bg-neutral-600"}`} onClick={() => toggleTextStyle("italic")}
                    >
                      <Italic className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-200 block">Text Color</label>
                  <div className="grid grid-cols-8 gap-1">
                    {[...((colorGroups[0] as IColourGroup).colors), ...((colorGroups[1] as IColourGroup).colors), ...((colorGroups[2] as IColourGroup).colors)].map((color) => (
                      <motion.button
                        key={`text-${color}`}
                        className="grid place-items-center size-6 rounded-sm hover:scale-110 transition-transform duration-75"
                        style={{ backgroundColor: color }}
                        onClick={() => handleTextColorClick(color)}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Select text color ${color}`}
                      >
                        {textColor === color && (<Check className="size-4 text-black stroke-2" style={{ filter: isLightColor(color) ? "none" : "invert(1)" }} />)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-neutral-900 rounded-md">
                  <p className="text-center"
                    style={{
                      fontFamily,
                      fontSize: `${fontSize}px`,
                      fontWeight: textStyle.bold ? "bold" : "normal",
                      fontStyle: textStyle.italic ? "italic" : "normal",
                      color: textColor,
                    }}
                  >
                    Hello World !
                  </p>
                </div>
              </div>
            )}

            {/* Pen Tab Content */}
            {activeTab === "pen" && (
              <div className="flex flex-col gap-3 p-3 max-h-80 overflow-y-auto">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-200 block">Pen Width</label>
                  <div className="flex items-center h-8">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePenWidthClick("decrease")}
                      className="h-full p-2 rounded-l-sm bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600"
                    >
                      <Minus className="size-4" />
                    </motion.button>
                    <div className="h-full flex-1 bg-neutral-700 border-t border-b border-neutral-600 py-1 px-2 text-center text-white">
                      {penWidth}px
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePenWidthClick("increase")}
                      className="h-full p-2 rounded-r-sm bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600"
                    >
                      <Plus className="size-4" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-200">Pen Color</label>
                  <div className="grid grid-cols-8 gap-1">
                    {[...((colorGroups[0] as IColourGroup).colors), ...((colorGroups[1] as IColourGroup).colors), ...((colorGroups[2] as IColourGroup).colors)].map((color) => (
                      <motion.button
                        key={`pen-${color}`}
                        className="grid place-items-center size-6 rounded-sm hover:scale-110 transition-transform duration-75"
                        style={{ backgroundColor: color }}
                        onClick={() => handlePenColorClick(color)}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Select pen color ${color}`}
                      >
                        {strokeColor === color && (<Check className="size-4 text-black stroke-2" style={{ filter: isLightColor(color) ? "none" : "invert(1)" }} />)}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center w-full h-12 p-2 bg-neutral-900 rounded-sm">
                  <div style={{ width: "80%", height: `${penWidth}px`, backgroundColor: strokeColor, borderColor: strokeColor, }} />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function isLightColor(color: string): boolean {
  return color === "#ffffff" || color === "#ffff00" || color === "#ffffcc"
}

export default ExtendedToolbar;