"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Shipments", icon: Box },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white safe-bottom">
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-8">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-semibold min-h-12 justify-center",
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
