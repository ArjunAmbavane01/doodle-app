"use client"

import { useEffect } from "react";
import { motion} from 'motion/react'
import { X } from "lucide-react";

const Toast = ({ message, type, onClose }:{message:string, type:string, onClose:()=>void}) => {
        useEffect(() => {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            
            return () => clearTimeout(timer);
        }, [onClose]);
    
        const bgColor = type === "error" ? "bg-red-500" : "bg-green-500";
        
        return (
            <motion.div 
                initial={{ opacity: 0, y: 50, x: "0%" }}
                animate={{ opacity: 1, y: 0, x: "0%" }}
                exit={{ opacity: 0, y: -20, x: "0%" }}
                className={`flex items-center gap-3 fixed bottom-6 right-5 z-[100] ${bgColor} text-white px-5 py-3 rounded-lg shadow-lg max-w-sm text-sm`}
            >
                <span className="flex-grow">{message}</span>
                <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                    <X className="size-4" />
                </button>
            </motion.div>
        );
    }; 
 
export default Toast;