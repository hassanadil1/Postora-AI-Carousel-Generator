import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Create a unique filename
    const filename = `${userId}/${Date.now()}-${file.name}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('postora-generations')
      .upload(filename, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('postora-generations')
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Error in upload API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 