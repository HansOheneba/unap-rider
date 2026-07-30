"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/",
    label: "Shipments",
    icon: Box,
    match: (path: string) => path === "/" || path.startsWith("/assignments"),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    match: (path: string) => path.startsWith("/profile"),
  },
];

/** Tab row only. Parent owns fixed positioning / safe area. */
export function BottomNavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("app-nav", className)}>
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-8">
        {links.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-12 min-w-16 flex-col items-center justify-center gap-1",
                active ? "text-zinc-900" : "text-zinc-400",
              )}
            >
              <Icon className={cn("h-6 w-6", active && "stroke-[2.5px]")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white safe-bottom">
      <BottomNavLinks />
    </div>
  );
}
