import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase, verifyConnection } from '@/lib/supabase';

// Use a cache to avoid repeated database operations for the same user
const userCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST() {
  try {
    const user = await currentUser();
    
    if (!user?.id || !user?.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = user.emailAddresses[0].emailAddress;
    
    // Check cache first
    const cachedUser = userCache.get(user.id);
    const now = Date.now();
    
    if (cachedUser && (now - cachedUser.timestamp < CACHE_TTL)) {
      // Return cached data if it's fresh
      return NextResponse.json(cachedUser.data);
    }
    
    // Verify connection before proceeding
    const isConnected = await verifyConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: "Database connection error", details: "Could not connect to database" },
        { status: 503 }
      );
    }
    
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let result;
      
      if (!existingUser) {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              auth_id: user.id,
              email,
              tier: 'free',
              last_login: new Date().toISOString(),
              metadata: {
                first_name: user.firstName,
                last_name: user.lastName,
                image_url: user.imageUrl
              }
            }
          ])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
        
        result = newUser;
      } else {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email,
            last_login: new Date().toISOString(),
            metadata: {
              first_name: user.firstName,
              last_name: user.lastName,
              image_url: user.imageUrl
            }
          })
          .eq('auth_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }
        
        result = updatedUser;
      }
      
      // Cache the result
      userCache.set(user.id, {
        data: result,
        timestamp: now
      });

      return NextResponse.json(result);

    } catch (dbError: any) {
      console.error('Database query failed:', dbError);
      return NextResponse.json(
        { error: "Database query failed", details: dbError.message || "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message || "Unknown error" },
      { status: 500 }
    );
  }
} 