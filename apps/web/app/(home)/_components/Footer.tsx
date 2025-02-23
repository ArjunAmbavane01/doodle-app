import Link from "next/link"
import { Twitter } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import ThemeToggle from "./ThemeToggle"

export default function Footer() {
  return (
    <footer className="flex w-full py-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 max-w-screen-8xl w-full mx-auto p-5 border-t">  
          <p className="text-sm text-muted-foreground">© Copyright 2020 - 2024. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="https://twitter.com">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
    </footer>
  )
}

