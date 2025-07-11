// app/page.tsx
import { Suspense } from "react"
import RathboneShrineClient from "@/components/RathboneShrineClient"
import TrackingScript from "@/components/TrackingScript"

export default function Home() {
  return (
    <>
      <TrackingScript />
      <main className="relative min-h-screen bg-black overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen text-green-400 font-mono">
              INITIALIZING RATHBONE PROTOCOL...
            </div>
          }
        >
          <RathboneShrineClient />
        </Suspense>
      </main>
    </>
  )
}
