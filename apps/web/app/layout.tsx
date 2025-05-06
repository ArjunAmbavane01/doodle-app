import { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "@workspace/ui/globals.css"
import LoadingProvider from "@/providers/LoadingProvider"
import SessionProvider from "@/providers/SessionProvider"
import { Providers } from "@/components/providers"
import { Toaster } from "@workspace/ui/components/sonner"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
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
      <head>
      </head>
      <SessionProvider>
        <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased bg-[#0C0C0C]`}>
          <Providers>
            <LoadingProvider>
              {children}
              <Toaster />
            </LoadingProvider>
          </Providers>
        </body>
      </SessionProvider>
    </html>
  )
}
