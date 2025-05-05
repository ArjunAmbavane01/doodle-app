// src/components/HoverButton.jsx
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

// add this before your function
interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}


export default function HoverButton({ label, ...props }: HoverButtonProps) {
    const btnRef = useRef<HTMLButtonElement>(null)
    const flairRef = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const button = btnRef.current;
        const flair = flairRef.current;
        if (!button || !flair) return;

        // quickSetters for performance
        const xSet = gsap.quickSetter(flair, 'xPercent')
        const ySet = gsap.quickSetter(flair, 'yPercent')

        const getXY = (e: any) => {
            const { left, top, width, height } = button.getBoundingClientRect()
            const xTransformer = gsap.utils.pipe(
                gsap.utils.mapRange(0, width, 0, 100),
                gsap.utils.clamp(0, 100)
            )
            const yTransformer = gsap.utils.pipe(
                gsap.utils.mapRange(0, height, 0, 100),
                gsap.utils.clamp(0, 100)
            )
            return { x: xTransformer(e.clientX - left), y: yTransformer(e.clientY - top) }
        }

        const onEnter = (e: any) => {
            const { x, y } = getXY(e)
            xSet(x); ySet(y)
            gsap.to(flair, { scale: 1, duration: 0.4, ease: 'power2.out' })
        }
        const onLeave = (e: any) => {
            const { x, y } = getXY(e)
            gsap.killTweensOf(flair)
            gsap.to(flair, {
                xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
                yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
                scale: 0,
                duration: 0.3,
                ease: 'power2.out'
            })
        }
        const onMove = (e: any) => {
            const { x, y } = getXY(e)
            gsap.to(flair, { xPercent: x, yPercent: y, duration: 0.4, ease: 'power2' })
        }

        button.addEventListener('mouseenter', onEnter)
        button.addEventListener('mouseleave', onLeave)
        button.addEventListener('mousemove', onMove)
        return () => {
            button.removeEventListener('mouseenter', onEnter)
            button.removeEventListener('mouseleave', onLeave)
            button.removeEventListener('mousemove', onMove)
        }
    }, [])

    return (
        <button
            ref={btnRef}
            className="relative overflow-hidden rounded-full border-2 border-white px-6 py-3 text-white font-semibold text-lg inline-flex items-center justify-center"
            {...props}
        >
            <span
                ref={flairRef}
                className="pointer-events-none absolute inset-0 rounded-full bg-white opacity-90 scale-0"
            />
            <span className="relative">{label}</span>
        </button>
    )
}
