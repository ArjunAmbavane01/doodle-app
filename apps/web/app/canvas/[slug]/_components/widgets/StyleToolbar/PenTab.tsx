import { Dispatch, SetStateAction, useState } from "react";
import { motion } from "motion/react";
import { colorGroups, IColourGroup, isLightColor } from "./StyleToolbar";
import { Minus, Plus, Check, } from "lucide-react"

interface PenTabProps {
  strokeColor: string,
  setStrokeColor: Dispatch<SetStateAction<string>>,
  selectStrokeColour: (strokeColor: string) => void,
  selectPenWidth: (penWidth: number) => void
}

const PenTab = ({ strokeColor, setStrokeColor, selectStrokeColour, selectPenWidth }: PenTabProps) => {

  const [penWidth, setPenWidth] = useState(2)

  const handlePenColorClick = (color: string) => {
    setStrokeColor(color)
    selectStrokeColour(color)
  }

  const handlePenWidthClick = (type: "increase" | "decrease") => {
    const modifier = type === "increase" ? 1 : -1;
    const newSize = Math.min(20, Math.max(1, penWidth + modifier));
    setPenWidth(newSize)
    selectPenWidth(newSize)
  }

  return (
    <div className="flex flex-col gap-3 p-3 pt-0 max-h-80 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <label className="text-xs text-neutral-200 block">Pen Width</label>
        <div className="flex items-center h-8">
          <motion.button
            className="h-full p-2 rounded-l-sm bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600"
            whileTap={{ scale: 0.95 }} onClick={() => handlePenWidthClick("decrease")}
          >
            <Minus className="size-4" />
          </motion.button>
          <div className="flex items-center justify-center w-full h-full flex-1 text-xs sm:text-base bg-neutral-700 border-t border-b border-neutral-600 py-1 px-2 text-center text-white">
            {penWidth}px
          </div>
          <motion.button
            className="flex items-center h-full p-2 rounded-r-sm bg-neutral-700 hover:bg-neutral-600 text-white border border-neutral-600"
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
              className="grid place-items-center size-5 sm:size-6 rounded-sm hover:scale-110 transition-transform duration-75"
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

      <div className="flex items-center justify-center w-full h-10 sm:h-12 p-2 bg-neutral-900 rounded-sm">
        <div style={{ width: "80%", height: `${penWidth}px`, backgroundColor: strokeColor, borderColor: strokeColor, }} />
      </div>
    </div>
  );
}

export default PenTab;