"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export function FloatingShapes() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Import GSAP
    const ctx = gsap.context(() => {
      const shapes = []

      // Create shaped elements
      for (let i = 0; i < 13; i++) {
        const imageNumber = i + 1;
        const cols = 4
        const rows = 4
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = (col + Math.random() * 0.6 + 0.2) * (100 / cols)
        const y = (row + Math.random() * 0.6 + 0.2) * (100 / rows)
        shapes.push(createImageShape(imageNumber, 60 + Math.random() * 20, x, y))

      }

      // Add shapes to container
      shapes.forEach((shape) => {
        if (containerRef.current) {
          containerRef.current.appendChild(shape)
        }
      })

      // Animate each shape with GSAP - more subtle movement around spawn point
      shapes.forEach((shape) => {
        // Get the initial position data from the element
        const initialX = parseFloat(shape.style.left);
        const initialY = parseFloat(shape.style.top);

        // Random slow duration for more subtle movement
        const duration = 3 + Math.random() * 10;

        // Smaller movement range (5-15% of viewport)
        const moveRangeX = 2 + Math.random() * 4;
        const moveRangeY = 2 + Math.random() * 4;

        // Gentle rotation
        gsap.to(shape, {
          rotation: `+=${Math.random() > 0.5 ? 10 : -10}`,
          duration: duration * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true
        })

        // Create random subtle movement
        // Instead of a fixed pattern, create random waypoints
        const randomMovement = () => {
          // Create a timeline for this single movement
          const tl = gsap.timeline({
            onComplete: () => { randomMovement(); }, // When complete, start a new random movement
            ease: "sine.inOut"
          });

          // Random direction within the confined range
          const randomX = initialX + (Math.random() * moveRangeX * 2 - moveRangeX);
          const randomY = initialY + (Math.random() * moveRangeY * 2 - moveRangeY);

          // Random duration for this movement
          const moveDuration = 2 + Math.random() * 3;

          // Animate to the random point
          tl.to(shape, {
            left: `${randomX}%`,
            top: `${randomY}%`,
            duration: moveDuration,
            ease: "sine.inOut",
          });

          return tl;
        };

        // Start the random movement
        randomMovement();

        // Add hover interactivity
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

    // Cleanup
    return () => ctx.revert()
  }, [])

  // Function to create an image shape
  function createImageShape(imageNumber: number, size: number, x: number, y: number) {
    const element = document.createElement("div")
    element.className = "absolute pointer-events-auto transition-transform"
    element.style.width = `${size}px`
    element.style.height = `${size}px`
    element.style.left = `${x}%`
    element.style.top = `${y}%`
    element.style.transform = `translate(-50%, -50%)`

    // Create image element
    const img = document.createElement("img")
    img.src = `/images/floatingShapes/flair-${imageNumber}.png`
    img.alt = `Shape ${imageNumber}`
    img.className = "w-full h-full"
    img.dataset.shapeId = imageNumber.toString()

    // Add image to container
    element.appendChild(img)

    return element
  }

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}