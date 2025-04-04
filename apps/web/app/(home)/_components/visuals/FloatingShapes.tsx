"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useSpring, animated } from "react-spring"

const SHAPES = [
  { type: "circle", size: [50, 50], color: "#FF3D00" },
  { type: "circle", size: [35, 35], color: "#9C27B0" },
  { type: "square", size: [40, 40], color: "#00E676" },
  { type: "square", size: [45, 45], color: "#2979FF" },
  { type: "pentagon", size: [55, 55], color: "#FFC400" },
  { type: "hexagon", size: [45, 45], color: "#D500F9" },
  { type: "hexagon", size: [65, 65], color: "#FFD54F" },
  { type: "triangle", size: [50, 50], color: "#00B8D4" },
  { type: "triangle", size: [40, 40], color: "#FF4081" },
  { type: "cross", size: [35, 35], color: "#76FF03" },
  { type: "donut", size: [50, 50], color: "#F50057" },
  { type: "donut", size: [50, 50], color: "#FFAB40" },
  { type: "star", size: [50, 50], color: "#6200EA" },
  { type: "star", size: [50, 50], color: "#FF1744" },
];

interface Position { x: number; y: number }

const getRandomPosition = (section: number) => {
  let minX = 0, maxX = 50, minY = 0, maxY = 50;

  switch (section) {
    case 0:
      minX = 0; maxX = 50;
      minY = 0; maxY = 50;
      break;
    case 1:
      minX = 50; maxX = 100;
      minY = 0; maxY = 50;
      break;
    case 2:
      minX = 0; maxX = 50;
      minY = 50; maxY = 100;
      break;
    case 3:
      minX = 50; maxX = 100;
      minY = 50; maxY = 100;
      break;
  }

  return { x: Math.random() * (maxX - minX) + minX, y: Math.random() * (maxY - minY) + minY, };
};

const Shape = React.memo(({ shape, position, mousePos, isHovering }: any) => {
  const distance = Math.hypot(mousePos.x - position.x, mousePos.y - position.y)
  const repelStrength = Math.min(Math.max(0, 20 - distance), 15)
  const angle = Math.atan2(position.y - mousePos.y, position.x - mousePos.x)
  const maxDistance = 30;
  const brightnessFactor = Math.max(0, 1 - distance / maxDistance);

  const repelX = isHovering ? Math.cos(angle) * repelStrength : 0
  const repelY = isHovering ? Math.sin(angle) * repelStrength : 0

  const springProps = useSpring({
    left: `${position.x + repelX}%`,
    top: `${position.y + repelY}%`,
    rotate: `${Math.sin(Date.now() / 2000 + position.x) * 15}deg`,
    opacity: 1,
    config: { mass: 1, tension: 40, friction: 18 },
  })

  return (
    <animated.div style={{
      ...springProps, position: "absolute", width: shape.size[0], height: shape.size[1],
      transform: springProps.rotate.to((r) => `translate(-50%, -50%) rotate(${r})`),
    }}>
      <div className="w-full h-full transition-all duration-300" style={{
        backgroundColor: shape.color,
        filter: `brightness(${1 + brightnessFactor})`,
        borderRadius: shape.type === "circle" ? "50%" : shape.type === "square" ? "4px" : shape.type === "triangle" ? "0" : "40% 60% 70% 30%",
        clipPath:
          shape.type === "triangle"
            ? "polygon(50% 0%, 0% 100%, 100% 100%)"
            : shape.type === "pentagon"
              ? "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
              : shape.type === "hexagon"
                ? "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
                : shape.type === "star"
                  ? "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
                  : shape.type === "donut"
                    ? "circle(50% at 50% 50%)"
                    : shape.type === "cross"
                      ? "polygon(25% 0%, 75% 0%, 75% 25%, 100% 25%, 100% 75%, 75% 75%, 75% 100%, 25% 100%, 25% 75%, 0% 75%, 0% 25%, 25% 25%)"
                      : undefined,
      }} />
    </animated.div>
  )
})

export const FloatingShapes = () => {
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const initialPositions = useMemo(() => SHAPES.map((_, i) => getRandomPosition(i % 4)), []);

  const [positions, setPositions] = useState(initialPositions);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prevPositions) => prevPositions.map((pos) => ({ x: pos.x + (Math.random() - 0.5) * 0.5, y: pos.y + (Math.random() - 0.5) * 0.5, })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 opacity-20 overflow-hidden" onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
      {SHAPES.map((shape, i) => (<Shape key={i} shape={shape} position={positions[i]} mousePos={mousePos} isHovering={isHovering} />))}
    </div>
  );
};
