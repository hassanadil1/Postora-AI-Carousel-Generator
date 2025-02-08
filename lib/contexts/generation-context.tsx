"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

interface GenerationContextType {
  bulletPoints: string[];
  setBulletPoints: (points: string[]) => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);

  return (
    <GenerationContext.Provider value={{ bulletPoints, setBulletPoints }}>
      {children}
    </GenerationContext.Provider>
  );
}

export function useGeneration() {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error('useGeneration must be used within a GenerationProvider');
  }
  return context;
} 