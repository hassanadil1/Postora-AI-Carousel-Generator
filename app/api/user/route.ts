import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // First check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Database query failed:', fetchError);
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
    }

    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: user.id,
          email: email,
          tier: 'free',
          last_login: new Date().toISOString(),
          metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl
          }
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      return NextResponse.json(newUser);
    }

    return NextResponse.json(existingUser);

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 