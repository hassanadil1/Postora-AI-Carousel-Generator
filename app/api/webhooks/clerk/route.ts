import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createHash, randomBytes } from 'crypto';

export async function POST(req: Request) {
  // Get the headers
  const headersList = await headers();
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Handle the webhook
    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, ...attributes } = evt.data;
      const email = email_addresses[0]?.email_address;

      if (!email) {
        return new NextResponse('No email found', { status: 400 });
      }

      // Generate a secure random string as a placeholder password
      const securePassword = createHash('sha256')
        .update(randomBytes(32).toString('hex'))
        .digest('hex');

      // Create or update user in Supabase
      const { error } = await supabase
        .from('users')
        .upsert({
          auth_id: id,
          email,
          password: securePassword, // Add secure random password
          tier: 'free',
          last_login: new Date().toISOString(),
          metadata: attributes
        });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    return new NextResponse('Error occurred', { status: 400 });
  }
} 