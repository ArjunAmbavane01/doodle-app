"use client"

import { Command } from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@workspace/ui/components/badge"

const ShortcutsSection = () => {
  const shortcuts = [
    { keys: ["⌘", "Z"], action: "Undo", description: "Revert your last action" },
    { keys: ["B"], action: "Draw Box", description: "Create a new box shape" },
    { keys: ["L"], action: "Draw Line", description: "Draw a straight line" },
    { keys: ["⌘", "C"], action: "Color Picker", description: "Select any color" },
    { keys: ["Space"], action: "Pan Canvas", description: "Move around the canvas" },
    { keys: ["⌘", "+"], action: "Zoom In", description: "Increase canvas size" },
  ]

  return (
    <section className="w-full py-24 bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.05),transparent_50%)]" />

      <div className="flex flex-col gap-16 w-full max-w-screen-8xl mx-auto px-16 relative">
        <motion.div
          className="flex flex-col gap-5 items-center text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Command className="size-12 relative z-10" />
            <motion.div
              className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>

          <Badge className="bg-white/5 text-white/80">Keyboard Shortcuts</Badge>
          <h2 className="font-heading text-4xl font-bold">Work Faster with Shortcuts</h2>
          <p className="font-body text-gray-400 max-w-lg">
            Master these shortcuts to enhance your workflow and boost productivity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 px-20">
          {shortcuts.map((shortcut, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" /> */}

              <div className="relative flex flex-col gap-5 bg-white/[0.03] rounded-xl p-8 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-center gap-3">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="px-3 py-1.5 rounded-lg font-body text-sm transition-all bg-white/5 border border-white/10 text-white group-hover:bg-white/10 group-hover:border-white/20"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
                <div className="text-center space-y-2">
                  <p className="font-heading text-lg text-white">{shortcut.action}</p>
                  <p className="text-sm text-gray-400">{shortcut.description}</p>
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

