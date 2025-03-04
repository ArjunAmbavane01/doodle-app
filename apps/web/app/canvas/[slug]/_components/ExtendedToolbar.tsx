"use client"

import { useState } from "react"
import { Paintbrush2, PaintBucket, Palette, X, Check, Layers, Pipette, CircleDashed, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Pen, Circle, Square, Minus, Plus, Maximize2, Minimize2, Menu,
} from "lucide-react"

type TabType = "color" | "text" | "pen"

interface IToolOption {
    name: string,
    value:string
}

interface IColourGroup {
    name: string,
    colors:string[];
}

const colorGroups:IColourGroup[] = [
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

const fontFamilies:IToolOption[] = [
  { name: "Sans Serif", value: "Arial, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Monospace", value: "Courier New, monospace" },
  { name: "Handwritten", value: "Comic Sans MS, cursive" },
  { name: "Elegant", value: "Garamond, serif" },
]

const penStyles:IToolOption[] = [
  { name: "Solid", value: "solid" },
  { name: "Dashed", value: "dashed" },
  { name: "Dotted", value: "dotted" },
]


const ExtendedToolbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("color")
  const [colorSubTab, setColorSubTab] = useState<"stroke" | "bg">("stroke")
  const [strokeColor, setStrokeColor] = useState("#ffffff")
  const [bgColor, setBgColor] = useState("transparent")
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Text options
  const [fontFamily, setFontFamily] = useState((fontFamilies[0] as IToolOption).value)
  const [fontSize, setFontSize] = useState(16)
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left")
  const [textStyle, setTextStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
  })

  // Pen options
  const [penWidth, setPenWidth] = useState(2)
  const [penStyle, setPenStyle] = useState((penStyles[0] as IToolOption).value)
  const [penOpacity, setPenOpacity] = useState(100)

  const handleColorClick = (color: string) => {
    if (colorSubTab === "stroke") {
      setStrokeColor(color)
      if (!recentColors.includes(color)) {
        setRecentColors((prev) => [color, ...prev.slice(0, 7)])
      }
    } else {
      setBgColor(color)
      if (color !== "transparent" && !recentColors.includes(color)) {
        setRecentColors((prev) => [color, ...prev.slice(0, 7)])
      }
    }
  }

  const toggleTextStyle = (style: keyof typeof textStyle) => {
    setTextStyle((prev) => ({
      ...prev,
      [style]: !prev[style],
    }))
  }

  return (
    <div className="absolute top-8 left-3 z-10 font-heading">
      <div className="flex flex-col gap-3 p-2 rounded-lg bg-white/10">
        <button className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
          aria-label="Open color menu"
        >
          <Menu className="size-4 text-white" />
        </button>
        
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            setActiveTab("color")
          }}
          className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
          aria-label="Open color menu"
        >
          <Palette className="size-4 text-white" />
        </button>

        <button
          onClick={() => {
            setIsOpen(!isOpen)
            setActiveTab("text")
          }}
          className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
          aria-label="Open text menu"
        >
          <Type className="size-4 text-white" />
        </button>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveTab("pen");
          }}
          className="flex items-center justify-center size-8 rounded bg-neutral-800 border border-neutral-700 shadow-lg hover:bg-neutral-700 transition-colors"
          aria-label="Open pen menu"
        >
          <Pen className="size-4 text-white" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-0 left-14 bg-neutral-800 rounded-lg border border-neutral-700 shadow-xl w-64 overflow-hidden">
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
            <button className="text-neutral-400 hover:text-white rounded-full p-1 hover:bg-neutral-700"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-3" />
            </button>
          </div>

          {/* Color Tab Content */}
          {activeTab === "color" && (
            <>
              <div className="flex border-b border-neutral-700">
                <button
                  className={`flex-1 p-2 flex items-center justify-center gap-2 ${
                    colorSubTab === "stroke" ? "bg-neutral-700" : "hover:bg-neutral-700/50"
                  }`}
                  onClick={() => setColorSubTab("stroke")}
                >
                  <Paintbrush2 className="size-3 text-white" />
                  <span className="text-sm text-white">Stroke</span>
                </button>
                <button
                  className={`flex-1 p-2 flex items-center justify-center gap-2 ${
                    colorSubTab === "bg" ? "bg-neutral-700" : "hover:bg-neutral-700/50"
                  }`}
                  onClick={() => setColorSubTab("bg")}
                >
                  <PaintBucket className="size-3 text-white" />
                  <span className="text-sm text-white">Fill</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 p-3 max-h-80 overflow-y-auto">
                {recentColors.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Pipette className="size-3 text-neutral-200" />
                      <h4 className="text-xs text-neutral-200">Recent</h4>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {recentColors.map((color) => (
                        <button
                          key={`recent-${color}`}
                          className="w-6 h-6 rounded-sm hover:scale-110 transition-transform relative"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorClick(color)}
                          aria-label={`Select color ${color}`}
                        >
                          {((colorSubTab === "stroke" && strokeColor === color) ||
                            (colorSubTab === "bg" && bgColor === color)) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className="size-3 text-black stroke-2"
                                style={{ filter: isLightColor(color) ? "none" : "invert(1)" }}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">

                {colorGroups.map((group) => (
                    <div key={group.name} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs text-neutral-200">{group.name}</h4>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {group.colors.map((color) => (
                        <button
                          key={color}
                          className="size-6 rounded-sm hover:scale-110 transition-transform relative"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorClick(color)}
                          aria-label={`Select color ${color}`}
                        >
                          {((colorSubTab === "stroke" && strokeColor === color) ||
                            (colorSubTab === "bg" && bgColor === color)) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="size-3 text-black stroke-2"
                                style={{ filter: isLightColor(color) ? "none" : "invert(1)" }}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                </div>

                {colorSubTab === "bg" && (
                    <button
                      className="flex items-center gap-2 text-sm text-white hover:bg-neutral-700 p-2 rounded w-full transition-colors duration-200"
                      onClick={() => setBgColor("transparent")}
                    >
                      <CircleDashed className="size-3 text-white" />
                      Transparent
                      {bgColor === "transparent" && <Check className="ml-auto size-3 text-white" />}
                    </button>
                )}
              </div>

              <div className="flex items-center justify-around p-3 border-t border-neutral-700 ">
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-sm border border-white"
                    style={{ backgroundColor: strokeColor }}
                  />
                  <span className="text-xs text-white">Stroke</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-sm border border-white"
                    style={{
                      backgroundColor: bgColor === "transparent" ? "transparent" : bgColor,
                      backgroundImage:
                        bgColor === "transparent"
                          ? "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px"
                          : "none",
                    }}
                  />
                  <span className="text-xs text-white">Fill</span>
                </div>
              </div>
            </>
          )}

          {/* Text Tab Content */}
          {activeTab === "text" && (
            <div className="flex flex-col gap-2 p-3 min-h-80">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-200 block">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-sm p-2 text-sm text-white"
                >
                  {fontFamilies.map((font) => (
                    <option key={font.name} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-200 block">Font Size</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setFontSize((prev) => Math.max(8, prev - 1))}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white p-1 rounded-l-md border border-neutral-600"
                  >
                    <Minimize2 className="size-3" />
                  </button>
                  <div className="flex-1 bg-neutral-700 border-t border-b border-neutral-600 py-1 px-2 text-center text-white">
                    {fontSize}px
                  </div>
                  <button
                    onClick={() => setFontSize((prev) => Math.min(72, prev + 1))}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white p-1 rounded-r-md border border-neutral-600"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-200 block">Text Style</label>
                <div className="flex border border-neutral-600 rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleTextStyle("bold")}
                    className={`flex-1 p-2 flex justify-center ${textStyle.bold ? "bg-neutral-600" : "bg-neutral-700 hover:bg-neutral-600"}`}
                  >
                    <Bold className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => toggleTextStyle("italic")}
                    className={`flex-1 p-2 flex justify-center ${textStyle.italic ? "bg-neutral-600" : "bg-neutral-700 hover:bg-neutral-600"}`}
                  >
                    <Italic className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => toggleTextStyle("underline")}
                    className={`flex-1 p-2 flex justify-center ${textStyle.underline ? "bg-neutral-600" : "bg-neutral-700 hover:bg-neutral-600"}`}
                  >
                    <Underline className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-200 block">Text Color</label>
                <div className="grid grid-cols-8 gap-1">
                  {(colorGroups[0] as IColourGroup).colors.concat((colorGroups[1] as IColourGroup).colors.slice(0, 4)).map((color) => (
                    <button
                      key={`text-${color}`}
                      className="w-6 h-6 rounded-sm hover:scale-110 transition-transform relative"
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                      aria-label={`Select text color ${color}`}
                    >
                      {strokeColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className="w-4 h-4 text-black stroke-2"
                            style={{ filter: isLightColor(color) ? "none" : "invert(1)" }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2 mt-2 bg-neutral-900 rounded-md">
                <p
                  className="text-center"
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    textAlign,
                    fontWeight: textStyle.bold ? "bold" : "normal",
                    fontStyle: textStyle.italic ? "italic" : "normal",
                    textDecoration: textStyle.underline ? "underline" : "none",
                    color: strokeColor,
                  }}
                >
                  Sample Text
                </p>
              </div>
            </div>
          )}

          {/* Pen Tab Content */}
          {activeTab === "pen" && (
            <div className="p-3 max-h-80 overflow-y-auto">
              <div className="mb-4">
                <label className="text-xs text-neutral-200 block">Pen Width</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setPenWidth((prev) => Math.max(1, prev - 1))}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white p-1 rounded-l-md border border-neutral-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 bg-neutral-700 border-t border-b border-neutral-600 py-1 px-2 text-center text-white">
                    {penWidth}px
                  </div>
                  <button
                    onClick={() => setPenWidth((prev) => Math.min(20, prev + 1))}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white p-1 rounded-r-md border border-neutral-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-neutral-400 block mb-1">Pen Style</label>
                <div className="grid grid-cols-3 gap-1">
                  {penStyles.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => setPenStyle(style.value)}
                      className={`p-2 text-xs text-center rounded-md ${
                        penStyle === style.value ? "bg-neutral-600" : "bg-neutral-700 hover:bg-neutral-600"
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs text-neutral-400 block mb-1">Opacity: {penOpacity}%</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={penOpacity}
                  onChange={(e) => setPenOpacity(Number.parseInt(e.target.value))}
                  className="w-full accent-neutral-500"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-neutral-400 block mb-1">Pen Color</label>
                <div className="grid grid-cols-8 gap-1">
                  {(colorGroups[0] as IColourGroup).colors.concat((colorGroups[1] as IColourGroup).colors.slice(0, 4)).map((color) => (
                    <button
                      key={`pen-${color}`}
                      className="w-6 h-6 rounded-sm hover:scale-110 transition-transform relative"
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                      aria-label={`Select pen color ${color}`}
                    >
                      {strokeColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className="w-4 h-4 text-black stroke-2"
                            style={{ filter: isLightColor(color) ? "none" : "invert(1)" }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2 mt-2 bg-neutral-900 rounded-md flex justify-center">
                <div className="w-full h-12 flex items-center justify-center">
                  <div
                    style={{
                      width: "80%",
                      height: `${penWidth}px`,
                      backgroundColor: strokeColor,
                      opacity: penOpacity / 100,
                      borderStyle: penStyle as any,
                      borderWidth: penStyle !== "solid" ? "1px" : "0",
                      borderColor: strokeColor,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function isLightColor(color: string): boolean {
  return color === "#ffffff" || color === "#ffff00" || color === "#ffffcc"
}

export default ExtendedToolbar;