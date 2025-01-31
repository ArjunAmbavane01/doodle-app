import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { Metadata } from "next"
import SessionProvider from "./providers/SessionProvider"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metaData: Metadata = {
  title: "Doodle app",
  description: "A collaborative drawing app that lets teams brainstorm, sketch, and share ideas in real time on an interactive canvas."
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider>
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
          <Providers>{children}</Providers>
        </body>
      </SessionProvider>
    </html>
  )
}
