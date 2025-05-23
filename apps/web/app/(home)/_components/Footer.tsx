import { Github, Linkedin, Mail, Twitter } from "lucide-react"

const socialLinks = [
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/ArjunAmbavane01",
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "https://x.com/AmbavaneArjun",
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
    <footer className="flex flex-col gap-10 w-full pt-24 border-t border-white/20 bg-black overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 items-center justify-between gap-12 lg:gap-24 max-w-screen-8xl w-full px-10 md:px-16 lg:px-20 mx-auto">

        <div className="flex flex-col gap-5 md:gap-8 col-span-2 lg:col-span-3">
          <div className="flex flex-col gap-3 md:gap-5 w-full mx-auto sm-mx-0">
            <div className="w-fit p-2 px-3 border rounded-full text-xs bg-white/10 text-white/90 mx-auto sm:mx-0">About Me</div>
            <h3 className="text-lg md:text-2xl font-body text-white text-center sm:text-left">Hey, I&apos;m Arjun! 👋</h3>
            <p className="text-sm lg:text-base font-body max-w-[600px] text-gray-300 leading-relaxed text-center sm:text-left">
              A passionate developer who loves building beautiful and functional web applications. Always learning,
              always coding.
            </p>
          </div>
          <a href="https://github.com/ArjunAmbavane01/doodle-app" target="_blank" rel="noreferrer" className="w-fit mx-auto sm:mx-0">
            <div className="flex gap-3 p-2 md:px-3 text-sm lg:text-base rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              ⭐ Star on GitHub
            </div>
          </a>
        </div>

        <div className="flex flex-col gap-8 px-0 lg:px-10 h-full w-full col-span-2">
          <div className="w-fit p-1 px-3 border rounded-full text-xs bg-white/10 text-white/90 mx-auto sm:mx-0">Connect</div>
          <div className="grid grid-cols-2 items-center gap-5 lg:gap-10">
            {socialLinks.map((link) => (
              <div key={link.label} className="w-full bg-blue-0 flex justify-start px-8 sm:px-0">
                <a className="group flex items-center gap-3 text-gray-400 hover:text-white place-items-center transition-colors w-fit"
                 href={link.href} target="_blank" rel="noreferrer">
                <div className="flex items-center justify-center size-8 sm:size-10 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
                  <link.icon className="size-3 sm:size-5" />
                </div>
                {link.label}
              </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 px-20 py-8 border-t border-white/10">
        <div className="flex items-center gap-2 font-body text-sm text-gray-400">
          Made by Arjun Ambavane
        </div>
      </div>
    </footer>
  )
}

