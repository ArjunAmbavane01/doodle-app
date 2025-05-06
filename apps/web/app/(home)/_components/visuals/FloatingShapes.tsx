"use client"

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";


const getInitialShapes = (window: Window): number => (window.innerWidth >= 1024) ? 13 : (window.innerWidth < 1024 && window.innerWidth >= 640) ? 9 : 6;


export function FloatingShapes() {

  const [totalShapes, setTotalShapes] = useState<number>(getInitialShapes(window));
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setTotalShapes(12);
      else if (window.innerWidth < 1024 && window.innerWidth >= 640) setTotalShapes(9);
      else if (window.innerWidth < 640) setTotalShapes(6);
    }
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [])

  useEffect(() => {
    if (!containerRef.current) return;

    if (containerRef.current.children.length > 0) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    const ctx = gsap.context(() => {

      const shapes: HTMLDivElement[] = [];

      for (let i = 0; i < totalShapes; i++) {
        const imageNumber = i % 10 + 1;
        const cols = 4
        const rows = 4
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = (col + Math.random() * 0.8 + 0.2) * (100 / cols)
        const y = (row + Math.random() * 0.8 + 0.2) * (100 / rows)
        shapes.push(createImageShape(imageNumber, 60 + Math.random() * 20, x, y))

      }

      shapes.forEach((shape) => {
        if (containerRef.current) {
          containerRef.current.appendChild(shape)
        }
      })

      shapes.forEach((shape) => {
        const initialX = parseFloat(shape.style.left);
        const initialY = parseFloat(shape.style.top);

        const duration = 3 + Math.random() * 10;

        const moveRangeX = 2 + Math.random() * 4;
        const moveRangeY = 2 + Math.random() * 4;

        gsap.to(shape, {
          rotation: `+=${Math.random() > 0.5 ? 10 : -10}`,
          duration: duration * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        })

        const randomMovement = () => {
          const tl = gsap.timeline({
            onComplete: () => { randomMovement(); },
            ease: "sine.inOut"
          });

          const randomX = initialX + (Math.random() * moveRangeX * 2 - moveRangeX);
          const randomY = initialY + (Math.random() * moveRangeY * 2 - moveRangeY);

          const moveDuration = 2 + Math.random() * 3;

          tl.to(shape, {
            left: `${randomX}%`,
            top: `${randomY}%`,
            duration: moveDuration,
            ease: "sine.inOut",
          });

          return tl;
        };

        randomMovement();

        shape.style.cursor = "pointer"
        shape.addEventListener("mouseenter", () => {
          gsap.to(shape, {
            scale: 1.1,
            filter: "brightness(1.3)",
            duration: 0.3,
          })
        })

        shape.addEventListener("mouseleave", () => {
          gsap.to(shape, {
            scale: 1,
            filter: "brightness(1)",
            duration: 0.3,
          })
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [totalShapes])

  function createImageShape(imageNumber: number, size: number, x: number, y: number) {
    const element = document.createElement("div")
    element.className = "absolute pointer-events-auto transition-transform"
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    element.style.left = `${x}%`
    element.style.top = `${y}%`
    element.style.transform = `translate(-50%, -50%)`

    const img = document.createElement("img")
    img.src = `/images/floatingShapes/flair-${imageNumber}.png`
    img.alt = `Shape ${imageNumber}`
    img.className = "w-full h-full"
    img.dataset.shapeId = imageNumber.toString()

    element.appendChild(img)

    return element
  }

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}