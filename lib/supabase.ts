import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
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

// Custom fetch with timeout
async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeout = 10000; // 10 seconds timeout
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal
    });
    return response;
  } catch (error) {
    console.error("Supabase fetch error:", error);
    throw error;
  } finally {
    clearTimeout(id);
  }
}

// Test the connection
supabase
  .from('users')
  .select('count')
  .limit(1)
  .then(({ error }) => {
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connected successfully');
    }
  }); 