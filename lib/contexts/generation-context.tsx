"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getData, storeData, STORAGE_KEYS } from '@/lib/local-storage';

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
      const stored = getData(STORAGE_KEYS.BULLET_POINTS);
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setBulletPoints(stored);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    setInitialized(true);
  }, []);

  // Save to localStorage when bulletPoints change
  useEffect(() => {
    if (initialized && bulletPoints.length > 0) {
      storeData(STORAGE_KEYS.BULLET_POINTS, bulletPoints);
    }
  }, [bulletPoints, initialized]);

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