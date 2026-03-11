"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar";
import { Home } from "lucide-react";

const NavIcon = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} className="h-5 w-5 flex-shrink-0 object-contain" />
);

const links = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="text-gray-600 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Course Setup",
    href: "/setup",
    icon: <NavIcon src="/open-book.png" alt="Course Setup" />,
  },
  {
    label: "Quiz Generator",
    href: "/quiz",
    icon: <NavIcon src="/telepathy.png" alt="Quiz Generator" />,
  },
  {
    label: "Study Planner",
    href: "/planner",
    icon: <NavIcon src="/calendar.png" alt="Study Planner" />,
  },
  {
    label: "Progress",
    href: "/progress",
    icon: <NavIcon src="/chart.png" alt="Progress" />,
  },
  {
    label: "AI Tutor",
    href: "/tutor",
    icon: <NavIcon src="/send.png" alt="AI Tutor" />,
  },
  {
    label: "Diagrams",
    href: "/diagrams",
    icon: <NavIcon src="/diagram.png" alt="Diagrams" />,
  },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          {/* Top: logo + nav links */}
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-1">
              {links.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                  className={cn(
                    "px-2 rounded-lg transition-colors",
                    pathname === link.href
                    ? "bg-gray-100 text-gray-900"
                    : "hover:bg-gray-100/70"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Bottom: branding */}
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex-shrink-0" />
            <motion.span
              animate={{ display: open ? "inline-block" : "none", opacity: open ? 1 : 0 }}
              className="text-xs text-gray-400 whitespace-pre"
            >
              AI Learning OS
            </motion.span>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 py-1 relative z-20">
    <div className="h-5 w-6 bg-gray-900 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-semibold text-gray-900 whitespace-pre text-sm"
    >
      AI Learning OS
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link href="/" className="flex items-center gap-2 py-1 relative z-20">
    <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  </Link>
);
