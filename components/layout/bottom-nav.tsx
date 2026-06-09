"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Today", icon: Zap },
  { href: "/history", label: "History", icon: Clock },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white safe-bottom">
      <div className="mx-auto flex h-16 max-w-lg items-stretch">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors min-h-12",
                active ? "text-zinc-900" : "text-zinc-400",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
