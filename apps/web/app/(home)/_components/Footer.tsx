import { Github, Heart, Linkedin, Mail, Twitter } from "lucide-react"

const socialLinks = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/ArjunAmbavane01",
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "https://twitter.com/ArjunAmbavane01",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/arjun-ambavane/",
  },
  {
    icon: Mail,
    label: "Email",
    href: "mailto:arjun.ambavane@gmail.com",
  },
]

export default function Footer() {
  return (
    <footer className="flex flex-col gap-10 w-full px-20 pt-24 border-t border-white/20 bg-black overflow-hidden">
      <div className="grid grid-cols-5 items-center justify-between gap-24 max-w-screen-8xl w-full mx-auto">

        {/* about section */}
        <div className="flex flex-col gap-8 col-span-3">
          <div className="flex flex-col gap-5">
            <div className="w-fit p-1 px-3 border rounded-full text-xs bg-white/10 text-white/90">About Me</div>
            <h3 className="text-2xl font-body text-white">Hey, I'm Arjun! 👋</h3>
            <p className="font-body w-[600px] text-gray-300 leading-relaxed">
              A passionate developer who loves building beautiful and functional web applications. Always learning,
              always coding.
            </p>
          </div>
          <a href="https://github.com/ArjunAmbavane01/doodle-app" target="_blank" className="w-fit">
            <div className="flex gap-3 p-2 px-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              ⭐ Star on GitHub
            </div>
          </a>
        </div>

        {/* connect section */}
        <div className="flex flex-col gap-8 px-10 h-full col-span-2">
          <div className="w-fit p-1 px-3 border rounded-full text-xs bg-white/10 text-white/90">Connect</div>
          <div className="grid grid-cols-2 gap-10">
            {socialLinks.map((link) => (
              <a className="group flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-fit"
              key={link.label} href={link.href} target="_blank">
                <div className="flex items-center justify-center size-10 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <link.icon className="size-5" />
                </div>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 px-20 py-8 border-t border-white/10">
        <div className="flex items-center gap-2 font-body text-sm text-gray-400">
          <Heart className="size-4 text-red-500" />
          Made with love by Arjun Ambavane
        </div>
      </div>
    </footer>
  )
}

