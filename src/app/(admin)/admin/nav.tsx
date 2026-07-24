"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  PenSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Posts", icon: FileText, exact: false },
  { href: "/admin/editor", label: "New Post", icon: PenSquare, exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:bg-accent/50 hover:text-foreground mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
        View Site
      </a>
    </nav>
  );
}
