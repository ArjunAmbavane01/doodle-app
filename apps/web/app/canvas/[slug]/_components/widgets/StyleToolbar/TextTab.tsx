import { useState } from "react";
import { motion } from "motion/react";
import { colorGroups, IColourGroup, isLightColor } from "./StyleToolbar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Bold, Check, Italic, Minus, Plus } from "lucide-react";

const fontFamilies: { name: string, value: string }[] = [
  { name: "Handwritten", value: "Caveat, Comic Sans MS, cursive" },
  { name: "Sans Serif", value: "Arial, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Elegant", value: "Garamond, Times New Roman, serif" },
]

interface TextTabProps {
  selectFontFamily: (fontFamily: string) => void,
  selectFontSize: (fontSize: number) => void,
  selectTextColor: (textColor: string) => void,
  selectTextStyle: (textStyle: { bold: boolean, italic: boolean }) => void,
}


const TextTab = ({ selectFontFamily, selectFontSize, selectTextColor, selectTextStyle }:TextTabProps) => {

  const [fontFamily, setFontFamily] = useState((fontFamilies[0]!).value);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textStyle, setTextStyle] = useState({ bold: false, italic: false });

  const handleFontSizeClick = (type: "increase" | "decrease") => {
    const modifier = type === "increase" ? 1 : -1;
    const newSize = Math.min(72, Math.max(8, fontSize + modifier));
    setFontSize(newSize)
    selectFontSize(newSize);
  }

  const handleTextColorClick = (color: string) => {
    setTextColor(color);
    selectTextColor(color);
  }

  const handleFontFamilyClick = (fontFamily: string) => {
    setFontFamily(fontFamily);
    selectFontFamily(fontFamily);
  }

  const toggleTextStyle = (style: keyof typeof textStyle) => {
    const updatedTextStyle = { ...textStyle, [style]: !textStyle[style], };
    setTextStyle(updatedTextStyle);
    selectTextStyle(updatedTextStyle);
  }

  return (
    <div className="flex flex-col gap-3 p-3 pt-0 min-h-80">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-200 block">Font Family</label>
        <Select value={fontFamily} onValueChange={handleFontFamilyClick}>
          <SelectTrigger className="p-2 rounded-sm text-xs sm:text-sm w-full bg-neutral-700 border border-neutral-600 text-white focus:outline-none focus:ring-0" value={fontFamily}>
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
          <motion.button className="grid place-items-center h-full w-8 rounded-l-sm border bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600" whileTap={{ scale: 0.95 }} onClick={() => handleFontSizeClick("decrease")}
          >
            <Minus className="size-3" />
          </motion.button>
          <div className="flex items-center justify-center w-full flex-1 h-full py-1 px-2 text-xs sm:text-base text-center text-white bg-neutral-700 border-t border-b border-neutral-600 ">
            {fontSize}px
          </div>
          <motion.button className="grid place-items-center h-full w-8 rounded-r-sm border bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600" whileTap={{ scale: 0.95 }} onClick={() => handleFontSizeClick("increase")}
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
            <Bold className="size-3 sm:size-4" />
          </button>
          <button className={`flex-1 p-2 flex justify-center ${textStyle.italic ? "bg-neutral-400/80" : "bg-neutral-700 hover:bg-neutral-600"}`} onClick={() => toggleTextStyle("italic")}
          >
            <Italic className="size-3 sm:size-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-200 block">Text Color</label>
        <div className="grid grid-cols-8 gap-1">
          {[...((colorGroups[0] as IColourGroup).colors), ...((colorGroups[1] as IColourGroup).colors), ...((colorGroups[2] as IColourGroup).colors)].map((color) => (
            <motion.button
              key={`text-${color}`}
              className="grid place-items-center size-5 sm:size-6 rounded-sm hover:scale-110 transition-transform duration-75"
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
  );
}

export default TextTab;