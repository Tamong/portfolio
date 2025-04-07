"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Avoid hydration mismatch by rendering component only on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleThemeToggle = () => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    // Get button element and position
    const buttonEl = buttonRef.current;
    if (!buttonEl) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    // Get the center of the button for animation origin
    const buttonRect = buttonEl.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Set CSS variables for the animation center point
    document.documentElement.style.setProperty(
      "--theme-toggle-x",
      `${buttonCenterX}px`,
    );
    document.documentElement.style.setProperty(
      "--theme-toggle-y",
      `${buttonCenterY}px`,
    );

    // Apply the view transition name to the root element
    document.documentElement.style.setProperty(
      "view-transition-name",
      "theme-toggle",
    );

    // Start the view transition
    document.startViewTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </Button>
  );
}
