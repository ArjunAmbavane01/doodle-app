import Link from "next/link"
import { Star, Twitter } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import ThemeToggle from "./ThemeToggle"

export default function Footer() {
  return (
    <footer className="flex w-full bg-black">
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 max-w-screen-8xl w-full mx-auto p-20 py-24 border-t">  
          <p className="text-sm text-muted-foreground">© Copyright 2020 - 2024. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white">
          <Button className="rounded-full py-0 ps-0">
      <div className="me-0.5 flex aspect-square h-full p-1.5">
        <img
          className="h-auto w-full rounded-full"
          src="https://originui.com/avatar.jpg"
          alt="Profile image"
          width={24}
          height={24}
          aria-hidden="true"
        />
      </div>
      @ArjunAmbavane01
    </Button>
    {/* <Button>
      <Star className="-ms-1 me-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
      <span className="flex items-baseline gap-2">
        Star
        <span className="text-xs text-primary-foreground/60">729</span>
      </span>
    </Button> */}
            {/* <Button variant="ghost" size="icon" asChild>
              <Link href="https://twitter.com">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </Button> */}
            <ThemeToggle />
          </div>
        </div>
    </footer>
  )
}

