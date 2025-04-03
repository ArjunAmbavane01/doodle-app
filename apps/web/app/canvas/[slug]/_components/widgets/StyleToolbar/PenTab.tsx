import { Dispatch, SetStateAction, useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus, Check, } from "lucide-react"
import { colorGroups, IColourGroup, isLightColor } from "./StyleToolbar";

interface PenTabProps {
  strokeColor: string,
  setStrokeColor: Dispatch<SetStateAction<string>>,
}

const PenTab = ({ strokeColor, setStrokeColor }: PenTabProps) => {

  const [penWidth, setPenWidth] = useState(2)

  const handlePenColorClick = (color: string) => {
    setStrokeColor(color)
    window.dispatchEvent(new CustomEvent("strokeColourChange", { detail: color }))
  }

  const handlePenWidthClick = (type: "increase" | "decrease") => {
    const modifier = type === "increase" ? 1 : -1;
    const newSize = Math.min(20, Math.max(1, penWidth + modifier));
    setPenWidth(newSize)
    window.dispatchEvent(new CustomEvent("penWidthChange", { detail: newSize }));
  }

  return (
    <div className="flex flex-col gap-3 p-3 max-h-80 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-200 block">Pen Width</label>
        <div className="flex items-center h-8">
          <motion.button
            className="h-full p-2 rounded-l-sm bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600"
            whileTap={{ scale: 0.95 }} onClick={() => handlePenWidthClick("decrease")}
          >
            <Minus className="size-4" />
          </motion.button>
          <div className="h-full flex-1 bg-neutral-700 border-t border-b border-neutral-600 py-1 px-2 text-center text-white">
            {penWidth}px
          </div>
          <motion.button
            className="h-full p-2 rounded-r-sm bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600"
            whileTap={{ scale: 0.95 }} onClick={() => handlePenWidthClick("increase")}
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
  );
}

export default PenTab;