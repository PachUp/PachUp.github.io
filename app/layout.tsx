import type React from "react"
import "./globals.css"
import "./styles/explore.css"
import "./styles/search-bar.css"
import "./styles/favorites-preview.css"
import "./styles/scrollbar-hide.css"
import "./styles/chat-bubble.css"
import "./styles/favorites.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Event Discovery Map",
  description: "Discover events near you with our interactive map",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
