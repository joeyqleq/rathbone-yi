import Head from "next/head"
import dynamic from "next/dynamic"
import { Suspense } from "react"

const RathboneShrine = dynamic(() => import("@/components/RathboneShrine"), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <script
          async
          defer
          src="https://tianji.motherfucking.fun/tracker.js"
          data-website-id="cmcsaucy804wirwk7iebqpn9g"
        ></script>
      </Head>

      <main className="relative min-h-screen bg-black overflow-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen text-green-400 font-mono">
              INITIALIZING RATHBONE PROTOCOL...
            </div>
          }
        >
          <RathboneShrine />
        </Suspense>
      </main>
    </>
  )
}
