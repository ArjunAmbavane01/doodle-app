import React from 'react';
import { motion } from 'motion/react';

const shapes = [
    { type: 'circle', size: [40, 120] },
    { type: 'square', size: [30, 90] },
    { type: 'triangle', size: [40, 100] },
    { type: 'pentagon', size: [50, 110] },
    { type: 'donut', size: [60, 120] },
];

const randomPosition = () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
});

export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {shapes.map((shape, i) => {
        const pos = randomPosition();
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
            }}
            animate={{
              x: [0, 30, -20, 10, 0],
              y: [0, -20, 30, -10, 0],
              rotate: [0, 45, -30, 15, 0],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div 
              className="border-2 border-white"
              style={{
                width: shape.size[0],
                height: shape.size[1],
                borderRadius: shape.type === 'circle' ? '50%' : 
                              shape.type === 'square' ? '4px' :
                              shape.type === 'triangle' ? '0' : '40% 60% 70% 30%',
                transform: shape.type === 'triangle' ? 'rotate(45deg)' : 'none'
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};