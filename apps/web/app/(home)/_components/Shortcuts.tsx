import { Command } from "lucide-react"

const ShortcutsSection = () => {

  const shortcuts = [
    { keys: ["⌘", "Z"], action: "Undo" },
    { keys: ["⌘", "B"], action: "Draw Box" },
    { keys: ["⌘", "L"], action: "Draw Line" },
    { keys: ["⌘", "C"], action: "Color Picker" },
    { keys: ["Space"], action: "Pan Canvas" },
    { keys: ["⌘", "+"], action: "Zoom In" },
  ]

  return (
    <section className="w-full py-24 bg-black">
      <div className="flex flex-col gap-16 w-full max-w-screen-8xl mx-auto px-16">
        <div className="flex flex-col gap-5 items-center text-center text-white">
          <Command className="size-12 " />
          <h2 className="font-heading text-4xl font-bold">Work Faster with Shortcuts</h2>
          <p className="font-body text-gray-600">Master these shortcuts to enhance your workflow</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex flex-col gap-5 bg-gray-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow group"
            >
              <div className="flex items-center justify-center gap-3">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className={`px-3 py-1.5 rounded font-body text-sm transition-colors bg-gray-50 group-hover:bg-black group-hover:text-white`}>
                    {key}
                  </kbd>
                ))}
              </div>
              <p className="text-center font-heading text-md text-gray-600">{shortcut.action}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ShortcutsSection;
