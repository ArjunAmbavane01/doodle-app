import { LucideIcon } from "lucide-react";
import { SelectedToolType } from "../../Canvas";

interface ToolButtonProps {
    tool:{ icon: LucideIcon, name: string, shortcut: string, type: SelectedToolType },
    activeTool: SelectedToolType,
    chooseTool: (type: SelectedToolType) => void

}

const ToolButton = ({tool, activeTool, chooseTool}:ToolButtonProps) => {
    return ( <div
        key={tool.type}
        onClick={() => chooseTool(tool.type)}
        className={`relative rounded-lg p-1.5 sm:p-2 md:p-3 hover:bg-black/10 font-heading group transition-colors duration-300 hover:scale-110 hover:cursor-pointer ${activeTool === tool.type ? "bg-blue-100 text-blue-800 hover:bg-blue-100" : "hover:bg-black/6"}`}
      >
        <tool.icon className="size-3 sm:size-4 md:size-5 text-zinc-800" strokeWidth={1.5} />
        <span
          className={`hidden md:block absolute bottom-0.5 right-[3px] text-[10px] font-medium transition-colors group-hover:text-black ${activeTool === tool.type ? "text-black" : "text-muted-foreground"}`}
        >
          {tool.shortcut}
        </span>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 -translate-y-3 px-2 py-1 text-xs opacity-0 font-medium text-black bg-white/90 rounded whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          {tool.name}
        </div>
      </div> );
}
 
export default ToolButton;