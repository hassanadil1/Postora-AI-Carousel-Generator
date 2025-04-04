import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const user = await currentUser();
    
    if (!user?.id || !user?.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const email = user.emailAddresses[0].emailAddress;
    
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

        return NextResponse.json(newUser);
      }

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

      return NextResponse.json(updatedUser);

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