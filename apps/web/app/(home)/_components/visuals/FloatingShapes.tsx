"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const shapes = []

      for (let i = 0; i < 11; i++) {
        const imageNumber = i%10 + 1;
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
  }, [])

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