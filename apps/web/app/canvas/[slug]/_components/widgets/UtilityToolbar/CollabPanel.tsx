"use client"

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react"
import { Avatar } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2, Copy, Users, X } from "lucide-react"

interface ICollaborator {
  userId: string,
  username: string,
  displayName: string
}

const CollabPanel = ({ sessionId, setOpen, onCollaboratorJoin }: { sessionId: string, setOpen: Dispatch<SetStateAction<boolean>>, onCollaboratorJoin: () => void }) => {
  const [collaborators, setCollaborators] = useState<ICollaborator[]>([{ userId: '', username: 'You', displayName: "" }])
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleCollaboratorJoin = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        const { userId, username, displayName } = customEvent.detail;
        setCollaborators([...collaborators, { userId, username, displayName }])
        onCollaboratorJoin();
      }
    }

    const handleCollaboratorLeft = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail) {
        const { userId } = customEvent.detail;
        const leftCollaborators = collaborators.filter((collaborator) => collaborator.userId !== userId);
        setCollaborators(leftCollaborators)
      }
    }

    window.addEventListener("collaboratorJoined", handleCollaboratorJoin)
    window.addEventListener("collaboratorLeft", handleCollaboratorLeft)

    return () => {
      window.removeEventListener("collaboratorJoined", handleCollaboratorJoin)
      window.removeEventListener("collaboratorLeft", handleCollaboratorLeft)
    }
  }, [collaborators, onCollaboratorJoin])

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
      className="flex flex-col bg-white font-body rounded-lg shadow-xl border border-zinc-600 overflow-hidden"
    >
      <div className="flex justify-between items-center p-4 py-2 border-b border-zinc-800">
        <h3 className="flex items-center gap-2 text-base text-zinc-900">
          <Users className="size-4 text-blue-600" />
          <span>Collaboration</span>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-zinc-900 hover:text-zinc-900 hover:bg-zinc-200"
          onClick={() => setOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-4 border-b border-zinc-800/50">
        <p className="text-sm font-medium text-zinc-900">Session ID</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-zinc-200/90 rounded-md px-3 py-2 text-xs font-body text-black overflow-hidden whitespace-nowrap text-ellipsis">
            {sessionId}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyClick}
            className={`flex items-center justify-center size-8 rounded-md ${isCopied ? 'bg-green-400':'bg-zinc-200/90 hover:bg-zinc-300'}   transition-colors`}
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
                  <CheckCircle2 className="size-4 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Copy className="size-4 text-zinc-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify gap-2">
          <p className="text-sm font-medium text-zinc-900">Collaborators</p>
          <Badge className="flex justify-center items-center px-2 py-1 bg-zinc-300 hover:bg-zinc-300 text-zinc-900 text-[8px]">
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
                className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-300/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="flex justify-center items-center size-8 bg-blue-200/80 text-indigo-200 border border-blue-600">
                    <span className="text-sm font-medium text-zinc-800">{collaborator.username.charAt(0)}</span>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-2 rounded-full bg-green-400 ring-2 ring-zinc-900"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900">{collaborator.username}</span>
                  <span className="text-xs text-zinc-500">{collaborator.displayName}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default CollabPanel

