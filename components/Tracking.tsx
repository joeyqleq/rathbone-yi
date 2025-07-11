// components/TrackingScript.tsx
"use client"

import { useEffect } from "react"

export default function TrackingScript() {
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://tianji.motherfucking.fun/tracker.js"
    script.setAttribute("data-website-id", "cmcsaucy804wirwk7iebqpn9g")
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  return null
}
