import React from 'react';
import { motion } from 'motion/react';

const shapes = [
  { type: 'circle', size: [50, 50] },
  { type: 'square', size: [40, 40] },
  { type: 'triangle', size: [50, 50] },
  { type: 'triangle', size: [70, 70] },
  { type: 'pentagon', size: [55, 55] },
  { type: 'pentagon', size: [65, 65] },
  { type: 'donut', size: [50, 50] },
  { type: 'star', size: [50, 50] },
  { type: 'hexagon', size: [65, 65] },
  { type: 'cross', size: [35, 35] },
];

const getRandomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const getGridPosition = () => {
  const x = getRandomInRange(5, 95);
  const y = getRandomInRange(5, 95);

  const jitter = 20;
  const randomJitterX = getRandomInRange(-jitter, jitter);
  const randomJitterY = getRandomInRange(-jitter, jitter);

  return {
    x: Math.min(Math.max(x + randomJitterX, 5), 95),
    y: Math.min(Math.max(y + randomJitterY, 5), 95),
  };
};

export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {shapes.map((shape, i) => {
        const pos = getGridPosition();
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, }}
            animate={{ x: [0, 30, -20, 10, 0], y: [0, -20, 30, -10, 0], rotate: [0, 45, -30, 15, 0], }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear" }}>
            <div className="border-2 border-white" style={{
              width: shape.size[0],
              height: shape.size[1],
              borderRadius: shape.type === 'circle' ? '50%' : shape.type === 'square' ? '4px' : shape.type === 'triangle' ? '0' : '40% 60% 70% 30%',
              transform: shape.type === 'triangle' ? 'rotate(45deg)' : 'none'
            }} />
          </motion.div>
        );
      })}
    </div>
  );
};