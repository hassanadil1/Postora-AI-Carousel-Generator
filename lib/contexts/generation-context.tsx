"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface GenerationContextType {
  bulletPoints: string[];
  setBulletPoints: (points: string[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on client only
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bulletPoints');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBulletPoints(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    setInitialized(true);
  }, []);

  // Only provide context value after initialization
  if (!initialized) {
    return null;
  }

  return (
    <GenerationContext.Provider value={{ 
      bulletPoints, 
      setBulletPoints, 
      loading, 
      setLoading 
    }}>
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