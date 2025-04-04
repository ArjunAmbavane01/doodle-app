"use client"

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"
import { Avatar } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2, Copy, Users, X } from "lucide-react"

interface ICollaborator {
  name: string
}

const CollabPanel = ({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) => {
  const sessionId = "5261dd2a-ee17-47f4-b11f-7d408fd7ce49"
  const [collaborators, setCollaborators] = useState<ICollaborator[]>([
    { name: "You" },
    { name: "Alex Kim" },
    { name: "Alex Kim" },
    { name: "Alex Kim" },
    { name: "Alex Kim" },
    { name: "Archit" },
  ])
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleCollaboratorJoin = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        setCollaborators([...collaborators, { name: customEvent.detail }])
      }
    }

    window.addEventListener("collaboratorJoined", handleCollaboratorJoin)

    return () => window.removeEventListener("collaboratorJoined", handleCollaboratorJoin)
  }, [collaborators])

  useEffect(() => {
    if (isCopied) timeoutRef.current = setTimeout(() => setIsCopied(false), 4000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [isCopied])

  const handleCopyClick = () => {
    navigator.clipboard.writeText(sessionId)
    setIsCopied(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col bg-zinc-900 text-zinc-100 font-body rounded-lg shadow-xl border border-zinc-600 overflow-hidden"
    >
      <div className="flex justify-between items-center p-4 py-2 border-b border-zinc-800">
        <h3 className="flex items-center gap-2 text-md">
          <Users className="size-4 text-blue-300" />
          <span>Collaboration</span>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-4 border-b border-zinc-800/50">
        <p className="text-sm font-medium text-zinc-400">Session ID</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-800/70 rounded-md px-3 py-2 text-xs font-body text-white overflow-hidden whitespace-nowrap text-ellipsis">
            {sessionId}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyClick}
            className="flex items-center justify-center size-8 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <AnimatePresence mode="wait">
              {isCopied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle2 className="size-4 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Copy className="size-4 text-zinc-200" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify gap-2">
          <p className="text-sm font-medium text-zinc-400">Collaborators</p>
          <Badge className="flex justify-center items-center px-2 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-800 text-[10px]">
            {collaborators.length}
          </Badge>
        </div>

        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {collaborators.map((collaborator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="flex justify-center items-center size-8 bg-blue-200/80 text-indigo-200 border border-blue-600">
                    <span className="text-sm font-medium text-zinc-800">{collaborator.name.charAt(0)}</span>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-400 ring-2 ring-zinc-900"></span>
                </div>
                <span className="text-sm text-zinc-200">{collaborator.name}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default CollabPanel

