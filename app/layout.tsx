import type React from "react"
import type { Metadata, Viewport } from "next"
import { VT323 } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const pixelFont = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

export const metadata: Metadata = {
  title: "Bloombroker - Plant Shop Idle Game",
  description:
    "Run your own plant shop! Buy at auctions, propagate rare variants, and satisfy customers in this cozy idle management game.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#e85d3b",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
