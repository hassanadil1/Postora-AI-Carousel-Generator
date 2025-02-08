import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { input_content, output_format } = await request.json();

    // Create generation record
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .insert([
        {
          user_id: user.id,
          input_content,
          output_format,
          status: 'queued'
        }
      ])
      .select()
      .single();

    if (genError) throw genError;

    return NextResponse.json(generation);

  } catch (error) {
    console.error('Error in generations API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's generations
    const { data: generations, error } = await supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(generations);

  } catch (error) {
    console.error('Error fetching generations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 