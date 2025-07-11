"use client"

import { useState } from "react"
import { BootupSequence } from "./BootupSequence"
import { CyberpunkGlobe } from "./CyberpunkGlobe"
import { MatrixRain } from "./MatrixRain"

export default function RathboneShrine() {
  const [phase, setPhase] = useState<"bootup" | "shrine">("bootup")

  const handleBootupComplete = () => {
    setPhase("shrine")
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <MatrixRain />

      {phase === "bootup" && <BootupSequence onComplete={handleBootupComplete} />}

      {phase === "shrine" && <CyberpunkGlobe />}
    </div>
  )
}
