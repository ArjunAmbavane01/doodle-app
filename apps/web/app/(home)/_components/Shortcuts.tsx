"use client"
import { Command } from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@workspace/ui/components/badge"

const ShortcutsSection = () => {
  const shortcuts = [
    { keys: ["⌘", "Z"], action: "Undo", description: "Revert your last action" },
    { keys: ["⌘", "C"], action: "Color Picker", description: "Select any color" },
    { keys: ["⌘", "+"], action: "Zoom In", description: "Increase canvas size" },
    { keys: ["B"], action: "Draw Box", description: "Create a new box shape" },
    { keys: ["Space"], action: "Pan Canvas", description: "Move around the canvas" },
    { keys: ["D"], action: "AI Generated Shapes", description: "Create shapes using AI" }
  ]

  return (
    <section className="w-full p-5 md:p-10 lg:p-20 py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.05),transparent_50%)]" />

      <div className="flex flex-col gap-16 w-full max-w-screen-8xl mx-auto">
        <motion.div className="flex flex-col gap-5 items-center text-center text-white"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        >
          <Command className="size-8 lg:size-12" />
          <Badge className="flex gap-1 font-body bg-gradient-to-b from-[#9be7f8] to-white text-black">Keyboard Shortcuts</Badge>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl leading-tight">Work Faster with Shortcuts</h2>
          <p className="max-w-lg font-body text-sm md:text-base tracking-wide text-gray-200">
            Master these shortcuts to enhance your workflow and boost productivity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-8 md:px-10">
          {shortcuts.map((shortcut, index) => (
            <motion.div key={index} className="group text-white"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col gap-3 sm:gap-5 h-full bg-white/5 rounded-lg p-5 md:p-8 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-colors hover:shadow-sm hover:shadow-blue-400">
                <div className="flex items-center justify-center gap-3">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd key={keyIndex} className="px-3 py-1.5 rounded-md font-body text-xs sm:text-sm transition-all bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 group-hover:shadow-sm group-hover:shadow-blue-400">
                      {key}
                    </kbd>
                  ))}
                </div>
                <div className="flex flex-col text-center gap-1">
                  <p className="font-heading text-sm sm:text-base md:text-lg">{shortcut.action}</p>
                  <p className="text-xs sm:text-sm text-gray-400">{shortcut.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShortcutsSection

