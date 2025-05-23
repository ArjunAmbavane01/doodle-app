import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { Button } from "@workspace/ui/components/button";
import { Sparkles, X } from "lucide-react";

interface PromptPanelProps {
    promptRef:MutableRefObject<HTMLTextAreaElement | null>,
    setIsPromptOpen: Dispatch<SetStateAction<boolean>>,
    generateAISvgPath: () => Promise<void>,
    isAIDrawingLoading: boolean,
}

const PromptPanel = ({promptRef, setIsPromptOpen, generateAISvgPath, isAIDrawingLoading}:PromptPanelProps) => {
    return (
        <div className="absolute right-0 sm:-right-20 top-10 sm:top-16 w-64 sm:w-80 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-100 overflow-hidden transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-5">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-2 sm:p-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sparkles className="size-3 sm:size-4 text-blue-600" />
                        <h3 className="text-sm sm:text-base text-zinc-800 font-heading font-semibold">AI Illustration Generator</h3>
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

            <div className="p-2 sm:p-4 flex flex-col gap-3 sm:gap-4">
                <div className="relative">
                    <textarea
                        ref={promptRef}
                        name="prompt"
                        id="prompt"
                        maxLength={100}
                        placeholder="Describe the illustration you want to generate..."
                        className="resize-none w-full h-20 sm:h-28 p-2 sm:p-3 text-xs sm:text-sm rounded border bg-white font-body text-black border-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    />
                </div>

                <Button
                    onClick={generateAISvgPath}
                    variant="default"
                    className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded transition-all duration-300 shadow-sm hover:shadow"
                >
                    <span className="flex items-center gap-2 text-xs sm:text-base font-body">
                        {isAIDrawingLoading ? 'Generating...' : <>Generate Illustration <Sparkles className="size-3 sm:size-3.5" /></>}
                    </span>
                </Button>

                <div className="flex flex-col justify-start gap-2 text-xs bg-blue-50 p-2 sm:p-3 rounded font-body">
                    <div className="text-xs sm:text-base text-zinc-700">Tips:</div>
                    <ul className="list-disc list-outside pl-3 text-zinc-600 space-y-1">
                        <li>Be specific about color, shapes and styles</li>
                        <li>Keep descriptions concise but detailed</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default PromptPanel;