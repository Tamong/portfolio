"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ParticleContextType {
  isEnabled: boolean;
  toggleParticles: () => void;
  setParticlesEnabled: (enabled: boolean) => void;
}

const ParticleContext = createContext<ParticleContextType | undefined>(
  undefined,
);

export function ParticleProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);

  // Load initial state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("particles-enabled");
    if (savedState !== null) {
      setIsEnabled(savedState === "true");
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("particles-enabled", isEnabled.toString());
  }, [isEnabled]);

  const toggleParticles = () => {
    setIsEnabled(!isEnabled);
  };

  const setParticlesEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
  };

  return (
    <ParticleContext.Provider
      value={{ isEnabled, toggleParticles, setParticlesEnabled }}
    >
      {children}
    </ParticleContext.Provider>
  );
}

export function useParticles() {
  const context = useContext(ParticleContext);
  if (context === undefined) {
    throw new Error("useParticles must be used within a ParticleProvider");
  }
  return context;
}
