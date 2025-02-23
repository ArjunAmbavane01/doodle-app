'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';

const SHAPES = [
  { type: 'circle', size: [50, 50], color: '#FF6B6B' },
  { type: 'square', size: [40, 40], color: '#4ECDC4' },
  { type: 'triangle', size: [50, 50], color: '#45B7D1' },
  { type: 'pentagon', size: [55, 55], color: '#96CEB4' },
  { type: 'hexagon', size: [45, 45], color: '#FFBE0B' },
  { type: 'star', size: [40, 40], color: '#FF006E' },
  { type: 'circle', size: [35, 35], color: '#8338EC' },
  { type: 'square', size: [45, 45], color: '#3A86FF' },
  { type: 'triangle', size: [40, 40], color: '#FB5607' },
  { type: 'pentagon', size: [50, 50], color: '#FF006E' },
];

interface Position {
  x: number;
  y: number;
}

const getRandomPosition = (min: number, max: number) => ({
  x: Math.random() * (max - min) + min,
  y: Math.random() * (max - min) + min,
});

export const FloatingShapes = () => {

  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const initialPositions = useMemo(() => 
    SHAPES.map(() => getRandomPosition(10, 90)),
    []
  );

  const [positions, setPositions] = useState(initialPositions);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  // Autonomous floating animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prevPositions =>
        prevPositions.map(pos => ({
          x: pos.x + (Math.random() - 0.5) * 0.5,
          y: pos.y + (Math.random() - 0.5) * 0.5,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);
  return (
      <div className="absolute inset-0 opacity-20" onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>
        {SHAPES.map((shape, i) => {
          const basePos = positions[i];
          const distance = isHovering ? Math.hypot(
            mousePos.x - (basePos as {x:number}).x,
            mousePos.y - (basePos as {y:number}).y
          ) : Infinity;
          
          const repelStrength = Math.min(Math.max(0, 20 - distance), 15);
          const angle = Math.atan2((basePos as {y:number}).y - mousePos.y, (basePos as {x:number}).x - mousePos.x);
          
          const repelX = isHovering ? Math.cos(angle) * repelStrength : 0;
          const repelY = isHovering ? Math.sin(angle) * repelStrength : 0;

          const finalX = (basePos as {x:number}).x + repelX;
          const finalY = (basePos as {y:number}).y + repelY;

          return (
            <div
              key={i}
              className="absolute transform transition-transform duration-300 ease-out"
              style={{
                left: `${finalX}%`,
                top: `${finalY}%`,
                width: shape.size[0],
                height: shape.size[1],
                transform: `translate(-50%, -50%) rotate(${Math.sin(Date.now() / 2000 + i) * 15}deg)`,
              }}
            >
              <div
                className="w-full h-full transition-all duration-300"
                style={{
                  backgroundColor: shape.color,
                  opacity: isHovering ? (distance < 20 ? 0.8 : 0.4) : 0.4,
                  borderRadius: shape.type === 'circle' ? '50%' : 
                              shape.type === 'square' ? '4px' :
                              shape.type === 'triangle' ? '0' : '40% 60% 70% 30%',
                  clipPath: shape.type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                           shape.type === 'pentagon' ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' :
                           shape.type === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                           shape.type === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                           undefined,
                  boxShadow: isHovering && distance < 20 ? 
                    `0 0 20px ${shape.color}40, 0 0 40px ${shape.color}20` : 'none',
                }}
              />
            </div>
          );
        })}
      </div>
  );
};