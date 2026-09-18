"use client"

import { useLayoutEffect, useRef, useState } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react"
import "./motion-image-reveal-slider-utils/index.css"

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value))
}

function useSliderColor(x: ReturnType<typeof useMotionValue<number>>, half: number) {
  return useTransform(
    x,
    [-half + 20, -half + 60, half - 60, half - 20],
    [
      "rgba(255, 255, 255, 0)",
      "rgba(255, 255, 255, 1)",
      "rgba(255, 255, 255, 1)",
      "rgba(255, 255, 255, 0)",
    ],
  )
}

function useKeyboard(x: ReturnType<typeof useMotionValue<number>>, half: number, step: number) {
  const onKeyDown = (event: KeyboardEvent) => {
    let delta = 0
    if (event.key === "ArrowLeft") delta = -step
    else if (event.key === "ArrowRight") delta = step
    else return
    animate(x, clamp(-half, half, x.get() + delta), {
      type: "spring",
      stiffness: 900,
      damping: 40,
      velocity: delta * 10,
    })
  }
  return {
    start: () => document.addEventListener("keydown", onKeyDown),
    stop: () => document.removeEventListener("keydown", onKeyDown),
  }
}

function HandleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 8 4 4-4 4" />
      <path d="m6 8-4 4 4 4" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
    </svg>
  )
}

export function ImageRevealSlider({
  src = "https://cdn.21st.dev/assets/mirror/f7/f7b281a721372cedf722cec50ee68404ce0ae174868ac3e35a02a867ac6adf5d.jpg",
  step = 50,
}: {
  src?: string
  step?: number
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const [half, setHalf] = useState(300)
  const clipPath = useTransform(x, [-half, half], [
    "inset(0% 0% 0% 0%)",
    "inset(0% 0% 0% 100%)",
  ])
  const backgroundColor = useSliderColor(x, half)
  const keyboard = useKeyboard(x, half, step)

  useLayoutEffect(() => {
    if (containerRef.current) {
      setHalf(containerRef.current.clientWidth / 2)
    }
  }, [])

  return (
    <div ref={containerRef} className="image-reveal-container">
      <div className="image-container">
        <motion.img src={src} alt="Kirby photo" className="image" />
        <motion.img
          style={{ clipPath }}
          src={src}
          alt="Kirby photo in black and white"
          className="image overlay"
        />
      </div>
      <motion.div
        className="slider"
        drag="x"
        dragElastic={0.05}
        dragConstraints={containerRef}
        style={{ x, backgroundColor }}
        tabIndex={0}
        onFocus={keyboard.start}
        onBlur={keyboard.stop}
      >
        <div className="handle">
          <HandleIcon />
        </div>
      </motion.div>
    </div>
  )
}

export default ImageRevealSlider
