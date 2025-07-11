"use client"

import dynamic from "next/dynamic"

// Lazy-load the heavy shrine scene only on the client
const RathboneShrine = dynamic(() => import("./RathboneShrine"), {
  ssr: false,
})

export default function RathboneShrineClient() {
  return <RathboneShrine />
}
