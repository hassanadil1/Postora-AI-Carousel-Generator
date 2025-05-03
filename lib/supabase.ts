import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

// Cache for connection tests to avoid repeated checks
let connectionVerified = false;
const connectionAttempts = new Map<string, { lastAttempt: number, status: 'success' | 'failure' }>();

// Custom fetch with timeout and retry
async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeout = 8000; // 8 seconds timeout
  const maxRetries = 2;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Create a new signal for each attempt
      const signal = controller.signal;
      const requestInit = { ...init, signal };
      
      const response = await fetch(input, requestInit);
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;
      
      // Log the error but continue for retries
      console.error(`Supabase fetch error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      // If not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = 200 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Fetch failed after multiple attempts');
}

// Create client with enhanced options
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
    global: {
      fetch: customFetch
    },
    db: {
      schema: 'public'
    }
  }
);

// Verify connection with throttling
export async function verifyConnection() {
  // Only verify once per instance in production
  if (process.env.NODE_ENV === 'production' && connectionVerified) {
    return true;
  }
  
  const cacheKey = 'connection-test';
  const now = Date.now();
  const cachedResult = connectionAttempts.get(cacheKey);
  
  // Use cached result if available and recent (within 5 minutes)
  if (cachedResult && (now - cachedResult.lastAttempt) < 5 * 60 * 1000) {
    return cachedResult.status === 'success';
  }
  
  try {
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      connectionAttempts.set(cacheKey, { lastAttempt: now, status: 'failure' });
      console.error('Supabase connection error:', error);
      return false;
    } else {
      connectionVerified = true;
      connectionAttempts.set(cacheKey, { lastAttempt: now, status: 'success' });
      return true;
    }
  } catch (e) {
    connectionAttempts.set(cacheKey, { lastAttempt: now, status: 'failure' });
    console.error('Supabase connection verification failed:', e);
    return false;
  }
}

// Verify connection on import but don't block
verifyConnection().catch(e => console.error('Initial connection verification failed:', e)); 