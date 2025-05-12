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
  title: "Doodle",
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
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0C0C0C" />
        <meta name="keywords" content="collaborative, drawing app, sketch, team collaboration, brainstorming canvas" />
        <meta name="author" content="Arjun Ambavane" />
        <meta property="og:title" content="Doodle - Collaborative Drawing App" />
        <meta property="og:description" content="Brainstorm, sketch, and share ideas in real time on an interactive canvas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.doodle.codes" />
        <link rel="icon" href="/favicon.ico" />
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
