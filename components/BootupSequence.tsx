"use client"

import { useState, useEffect } from "react"

interface BootupSequenceProps {
  onComplete: () => void
}

export function BootupSequence({ onComplete }: BootupSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [progress, setProgress] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)

  const steps = [
    "Establishing connection...",
    "🛰 Scanning star system for Zionist vermin 🇮🇱 ...",
    "✅ Sector clear. Prepare orbital link with Lord Rathbone.",
    "Lord Rathbone, you have an offering from your loyal servants.",
  ]

  useEffect(() => {
    if (currentStep >= steps.length) return

    const text = steps[currentStep]
    let charIndex = 0

    const typeInterval = setInterval(
      () => {
        if (charIndex <= text.length) {
          setDisplayText(text.substring(0, charIndex))
          charIndex++
        } else {
          clearInterval(typeInterval)

          if (currentStep < 2) {
            // Faster progress bar animation
            const progressInterval = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 100) {
                  clearInterval(progressInterval)
                  setTimeout(() => {
                    setCurrentStep((prev) => prev + 1)
                    setProgress(0)
                    setDisplayText("")
                  }, 200) // Reduced delay
                  return 100
                }
                return prev + 4 // Faster progress
              })
            }, 20) // Faster interval
          } else if (currentStep === 2) {
            // Final progress - even faster
            const finalProgressInterval = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 100) {
                  clearInterval(finalProgressInterval)
                  setTimeout(() => {
                    setCurrentStep((prev) => prev + 1)
                    setDisplayText("")
                  }, 300)
                  return 100
                }
                return prev + 3
              })
            }, 15)
          } else {
            // Final message with intense glitch effect
            setTimeout(() => {
              setIsGlitching(true)
              setTimeout(() => {
                onComplete()
              }, 1200) // Reduced from 2000
            }, 600) // Reduced from 1000
          }
        }
      },
      30 + Math.random() * 30, // Faster typing speed
    )

    return () => clearInterval(typeInterval)
  }, [currentStep, onComplete])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black z-50">
      {/* Enhanced scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 65, 0.2) 1px, rgba(0, 255, 65, 0.2) 3px)",
            animation: "scanlines 0.1s linear infinite",
          }}
        />
      </div>

      <div className="text-center space-y-6 font-mono px-4">
        {/* Enhanced Terminal Text */}
        <div className="relative">
          <div
            className={`text-lg md:text-2xl lg:text-3xl transition-all duration-100 ${
              isGlitching
                ? "animate-pulse text-red-400 scale-110"
                : currentStep === 1
                  ? "text-yellow-400"
                  : currentStep === 2
                    ? "text-green-400"
                    : "text-green-400"
            }`}
            style={{
              textShadow: isGlitching
                ? "0 0 15px #ff0000, 0 0 30px #ff0000, 0 0 45px #ff0000, 3px 0 #00ffff, -3px 0 #ff00ff, 0 3px #ffff00"
                : currentStep === 1
                  ? "0 0 15px #ffff00, 0 0 30px #ffaa00"
                  : "0 0 15px #00ff41, 0 0 30px #00ff41",
              filter: isGlitching ? "hue-rotate(180deg) saturate(3) contrast(2)" : "none",
            }}
          >
            {displayText}
            <span className="animate-pulse text-white">|</span>
          </div>

          {/* Intense glitch overlay */}
          {isGlitching && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-transparent to-blue-500 opacity-40 animate-ping" />
              <div className="absolute inset-0 bg-gradient-to-l from-yellow-500 via-transparent to-purple-500 opacity-30 animate-pulse" />
            </>
          )}
        </div>

        {/* Enhanced Progress Bar */}
        {currentStep < steps.length - 1 && (
          <div className="w-80 md:w-96 mx-auto">
            <div className="relative h-6 bg-gray-900 border-2 border-green-400 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-green-400 transition-all duration-75 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-40 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-ping" />
              </div>

              {/* Enhanced progress bar glow */}
              <div
                className="absolute top-0 h-full bg-green-400 opacity-60 blur-md transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-green-400 text-sm mt-2 font-mono flex justify-between">
              <span>PROGRESS: {Math.floor(progress)}%</span>
              <span className="animate-pulse">RATHBONE_PROTOCOL</span>
            </div>
          </div>
        )}

        {/* Enhanced System Status */}
        <div className="text-green-400 text-xs md:text-sm space-y-1 opacity-70">
          <div className="flex justify-center gap-8">
            <span>SYSTEM STATUS: ONLINE</span>
            <span>SECURITY LEVEL: MAXIMUM</span>
          </div>
          <div className="flex justify-center gap-8">
            <span>ORBITAL DEFENSE: {currentStep >= 1 ? "SCANNING" : "STANDBY"}</span>
            <span>RATHBONE PROTOCOL: {currentStep >= 2 ? "ACTIVE" : "INITIALIZING"}</span>
          </div>
        </div>
      </div>

      {/* Enhanced screen distortion for final glitch */}
      {isGlitching && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-red-500 via-transparent to-blue-500 opacity-30 animate-ping" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-transparent to-red-500 opacity-20 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 via-transparent to-purple-500 opacity-25 animate-bounce" />
        </div>
      )}
    </div>
  )
}
