"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

export default function Nav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks = [
    { href: "/games", label: "Games" },
    { href: "/posts", label: "Posts" },
    { href: "/resume", label: "Resume" },
  ];

  return (
    <nav className="mb-8 flex flex-row items-center justify-between">
      <Link href="/">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Philip Wallis
        </h1>
      </Link>

      {/* Desktop navigation */}
      <div className="hidden items-center md:flex">
        {navLinks.map((link) => (
          <Link key={link.href} prefetch={true} href={link.href}>
            <Button variant="link">{link.label}</Button>
          </Link>
        ))}
        <ThemeToggle />
      </div>

      {/* Mobile navigation */}
      <div className="flex items-center md:hidden">
        <ThemeToggle />
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-1">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader hidden={true}>
              <DrawerTitle>Navigation</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col items-center gap-4 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  prefetch={true}
                  href={link.href}
                  className="w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-lg"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="ghost">
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}
