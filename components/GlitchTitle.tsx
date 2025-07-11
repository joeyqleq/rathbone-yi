"use client"

import { useEffect, useState } from "react"

const title = "ALL HAIL THE LORD RATHBONE"
const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ01"

export function GlitchTitle() {
  const [displayText, setDisplayText] = useState(title)
  const [letterStates, setLetterStates] = useState<Array<{ isGlitching: boolean; intensity: number; char: string }>>(
    title.split("").map((char) => ({ isGlitching: false, intensity: 0, char })),
  )

  useEffect(() => {
    // Individual letter animation intervals
    const intervals: NodeJS.Timeout[] = []

    title.split("").forEach((originalChar, index) => {
      if (originalChar === " ") return

      const interval = setInterval(
        () => {
          setLetterStates((prev) => {
            const newStates = [...prev]
            const shouldGlitch = Math.random() < 0.15 // 15% chance per tick

            if (shouldGlitch) {
              newStates[index] = {
                isGlitching: true,
                intensity: Math.random(),
                char: glitchChars[Math.floor(Math.random() * glitchChars.length)],
              }

              // Reset after random duration
              setTimeout(
                () => {
                  setLetterStates((current) => {
                    const resetStates = [...current]
                    resetStates[index] = {
                      isGlitching: false,
                      intensity: 0,
                      char: originalChar,
                    }
                    return resetStates
                  })
                },
                50 + Math.random() * 150,
              )
            }

            return newStates
          })
        },
        300 + Math.random() * 800, // Random interval per letter
      )

      intervals.push(interval)
    })

    return () => {
      intervals.forEach(clearInterval)
    }
  }, [])

  useEffect(() => {
    setDisplayText(letterStates.map((state) => state.char).join(""))
  }, [letterStates])

  return (
    <div className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 z-10 px-4 w-full max-w-7xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-mono font-bold text-center leading-tight">
        <div className="flex flex-wrap justify-center items-center gap-1 md:gap-2">
          {title.split(" ").map((word, wordIndex) => (
            <div key={wordIndex} className="flex">
              {word.split("").map((_, charIndex) => {
                const globalIndex =
                  title.split(" ").slice(0, wordIndex).join(" ").length + (wordIndex > 0 ? 1 : 0) + charIndex
                const state = letterStates[globalIndex]

                return (
                  <span
                    key={`${wordIndex}-${charIndex}`}
                    className={`inline-block transition-all duration-75 ${
                      state?.isGlitching ? "text-red-400 animate-pulse" : "text-green-400"
                    }`}
                    style={{
                      textShadow: state?.isGlitching
                        ? `0 0 ${10 + (state.intensity || 0) * 25}px #ff0000, 
                           0 0 ${20 + (state.intensity || 0) * 50}px #ff0000, 
                           0 0 ${30 + (state.intensity || 0) * 75}px #ff0000,
                           ${2 + (state.intensity || 0) * 6}px 0 #00ffff, 
                           ${-2 - (state.intensity || 0) * 6}px 0 #ff00ff,
                           0 ${2 + (state.intensity || 0) * 6}px #ffff00`
                        : "0 0 15px #00ff41, 0 0 30px #00ff41, 0 0 45px #00ff41",
                      filter: state?.isGlitching
                        ? `hue-rotate(${(state.intensity || 0) * 360}deg) saturate(${2 + (state.intensity || 0) * 4}) contrast(${1 + (state.intensity || 0) * 3})`
                        : "none",
                      transform: state?.isGlitching
                        ? `scale(${1 + (state.intensity || 0) * 0.3}) skew(${(Math.random() - 0.5) * (state.intensity || 0) * 30}deg, ${(Math.random() - 0.5) * (state.intensity || 0) * 15}deg)`
                        : "none",
                      color: state?.isGlitching
                        ? `hsl(${(state.intensity || 0) * 360}, 100%, ${50 + (state.intensity || 0) * 30}%)`
                        : undefined,
                    }}
                  >
                    {state?.char || title[globalIndex]}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </h1>

      {/* Enhanced background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-20 animate-pulse" />
      {letterStates.some((state) => state.isGlitching) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-l from-red-500 via-transparent to-blue-500 opacity-30 animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 via-transparent to-purple-500 opacity-25 animate-bounce" />
        </>
      )}
    </div>
  )
}
