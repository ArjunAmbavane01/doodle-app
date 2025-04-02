"use client"

import { Avatar } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Copy, Users, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface collaborator {
  name: string
}

const CollaboratorMenu = ({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) => {

  const sessionId = '5261dd2a-ee17-47f4-b11f-7d408fd7ce49';
  const [collaborators, setCollaborators] = useState<collaborator[]>([{ name: "You" }, { name: "Alex Kim" }, { name: "Archit" }]);
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isCopied)
      timeoutRef.current = setTimeout(() => setIsCopied(false), 5000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isCopied])

  const handleCopyClick = () => {
    navigator.clipboard.writeText(sessionId);
    setIsCopied(true);
  };

  return (
    <div className="flex flex-col p-2">
      <div className="flex justify-between p-2 py-3">
        <p className="flex items-center gap-2 text-md font-body"><Users className="size-4" />Collaboration</p>
        <Button variant={"ghost"} onClick={() => setOpen(false)}><X className="size-3" /></Button>
      </div>
      <div className="flex flex-col gap-1 px-2 pb-3 border-b-[1px] border-slate-300">
        <p className="font-semibold font-body text-sm">Session ID</p>
        <div className="flex justify-between gap-2 items-center">
          <Badge className="text-xs bg-blue-100 rounded-sm text-indigo-800 hover:bg-blue-100 p-2 w-52 truncate overflow-hidden text-ellipsis whitespace-nowrap">
            {sessionId}
          </Badge>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopyClick}
            className="p-1 text-slate-400 transition-colors"
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
                  <CheckCircle2 className="size-5 text-emerald-600" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Copy className="size-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

      </div>
      <div className="flex flex-col gap-3 p-2 py-3 pb-5">
        <p className="font-semibold text-sm">Collaborators ({collaborators.length})</p>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {collaborators.map((collaborator, idx) => (
              <motion.div
                key={collaborator.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="flex items-center gap-3 group p-2 rounded-md hover:bg-gray-50"
              >
                <div className="relative">
                  <Avatar className="flex items-center justify-center size-8 bg-indigo-100 text-indigo-800 text-sm">
                    {collaborator.name.charAt(0)}
                  </Avatar>
                  <span className={`absolute bottom-0 right-0 size-2 rounded-full bg-green-400 ring-2 ring-white`}></span>
                </div>
                <span className="text-sm text-slate-700 font-body">{collaborator.name}</span>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <p></p>
    </div>
  );
}

export default CollaboratorMenu;