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

interface AdminNavProps {
  orientation?: "vertical" | "horizontal";
}

export function AdminNav({ orientation = "vertical" }: AdminNavProps) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";

  return (
    <nav
      className={cn(
        horizontal
          ? "scrollbar-hidden flex items-center gap-1 overflow-x-auto"
          : "flex flex-col gap-1",
      )}
    >
      {LINKS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md text-sm whitespace-nowrap transition-colors",
              horizontal ? "px-3 py-1.5" : "px-3 py-2",
              active
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className={cn(
          "text-muted-foreground hover:bg-accent/50 hover:text-foreground flex items-center gap-2 rounded-md text-sm whitespace-nowrap transition-colors",
          horizontal ? "px-3 py-1.5" : "mt-2 px-3 py-2",
        )}
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        View Site
      </a>
    </nav>
  );
}
