import { Check, CircleDashed, Paintbrush2, PaintBucket, Pipette } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { colorGroups, isLightColor } from "./StyleToolbar";
import { motion } from "motion/react";

interface ColorTabProps {
  strokeColor: string,
  setStrokeColor: Dispatch<SetStateAction<string>>
}
const ColorTab = ({ strokeColor, setStrokeColor }: ColorTabProps) => {

  const [colorSubTab, setColorSubTab] = useState<"stroke" | "bg">("stroke");
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [bgColor, setBgColor] = useState("transparent");

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

  return (
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
                  style={{ backgroundColor: color }} onClick={() => handleColorClick(color)} aria-label={`Select color ${color}`}>
                  {((colorSubTab === "stroke" && strokeColor === color) || (colorSubTab === "bg" && bgColor === color)) &&
                      <Check className="size-3 text-black stroke-2" style={{ filter: isLightColor(color) ? "none" : "invert(1)" }}/>
                  }
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
                  <motion.button key={color} className="grid place-items-center size-6 rounded-sm hover:scale-110 transition-transform duration-75 ease-out"
                    style={{ backgroundColor: color }} onClick={() => handleColorClick(color)} whileTap={{ scale: 0.95 }} aria-label={`Select color ${color}`}>
                    {((colorSubTab === "stroke" && strokeColor === color) || (colorSubTab === "bg" && bgColor === color)) &&
                      <Check className="size-3 text-black stroke-2" style={{ filter: isLightColor(color) ? "none" : "invert(1)" }} />
                    }
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {colorSubTab === "bg" && (
          <button className="flex items-center gap-2 text-sm text-white hover:bg-neutral-700 p-2 rounded w-full transition-colors duration-200"
            onClick={() => handleColorClick("transparent")}>
            <CircleDashed className="size-3" />
            Transparent{" "}
            {bgColor === "transparent" && <Check className="ml-auto size-3 text-white" /> }
          </button>
        )}
      </div>

      <div className="flex items-center justify-around p-3 text-xs text-white border-t border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-sm border border-white hover:cursor-pointer" 
          onClick={()=>setColorSubTab("stroke")}
          style={{ backgroundColor: strokeColor }} />
          Stroke
        </div>
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-sm border border-white hover:cursor-pointer"
          onClick={()=>setColorSubTab("bg")}
            style={{
              backgroundColor: bgColor === "transparent" ? "transparent" : bgColor,
              backgroundImage: bgColor === "transparent" ? "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 8px 8px" : "none",
            }}
          />
          Fill
        </div>
      </div>
    </>
  );
};

export default ColorTab;
