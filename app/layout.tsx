import type { Metadata } from 'next'
import './globals.css'

export const metadata = {
  title: "All Hail Lord Rath of the bone",
  description: "A shrine forged in pixels and vengeance.",
  generator: 'All Hail Lord Rath of the bone',
}

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
