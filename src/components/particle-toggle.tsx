"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParticles } from "@/components/effects/particle-context";

export function ParticleToggle() {
  const { isEnabled, toggleParticles } = useParticles();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Avoid hydration mismatch by rendering component only on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleParticleToggle = () => {
    // Check if View Transitions API is supported
    if (!document.startViewTransition) {
      toggleParticles();
      return;
    }

    // Get button element and position
    const buttonEl = buttonRef.current;
    if (!buttonEl) {
      toggleParticles();
      return;
    }

    // Get the center of the button for animation origin
    const buttonRect = buttonEl.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Set CSS variables for the animation center point
    document.documentElement.style.setProperty(
      "--particle-toggle-x",
      `${buttonCenterX}px`,
    );
    document.documentElement.style.setProperty(
      "--particle-toggle-y",
      `${buttonCenterY}px`,
    );

    // Apply the view transition name to the root element
    document.documentElement.style.setProperty(
      "view-transition-name",
      "particle-toggle",
    );

    // Start the view transition
    document.startViewTransition(() => {
      toggleParticles();
    });
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={handleParticleToggle}
      aria-label="Toggle particle effects"
    >
      {isEnabled ? <Sparkles className="h-5 w-5" /> : <X className="h-5 w-5" />}
    </Button>
  );
}
