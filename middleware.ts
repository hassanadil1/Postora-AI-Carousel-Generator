import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// List of routes that should be protected (require authentication)
const protectedRoutes = createRouteMatcher(["/create", "/templates"]);

// Keep track of recent syncs to avoid repeated calls
const recentSyncs = new Map<string, number>();
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken } = await auth();
  
  // If user is authenticated, ensure they exist in Supabase
  if (userId) {
    // Check if we've synced this user recently
    const lastSync = recentSyncs.get(userId);
    const now = Date.now();
    
    if (!lastSync || (now - lastSync) > SYNC_INTERVAL) {
      // Update the sync time before making the request
      recentSyncs.set(userId, now);
      
      // Sync user in the background, don't block the request
      syncUser(userId, req.nextUrl.origin, getToken).catch(error => {
        console.error('Background user sync failed:', error);
      });
    }
  }

  // Check if the route is protected
  if (protectedRoutes(req) && !userId) {
    // If trying to access protected route without auth, redirect to sign-in
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to public routes or authenticated users
  return NextResponse.next();
});

// Separate function to handle user syncing with retries
async function syncUser(userId: string, origin: string, getToken: () => Promise<string | null>) {
  const maxRetries = 3;
  const baseDelay = 500; // Start with 500ms delay
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const token = await getToken();
      if (!token) {
        console.error('No auth token available for user sync');
        return;
      }
      
      const response = await fetch(`${origin}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        return; // Success!
      }
      
      // If response is not OK, log and continue to retry
      console.error('Failed to sync user:', await response.text());
      
    } catch (error) {
      // Log error but don't throw it so we can retry
      console.error(`Error syncing user (attempt ${attempt + 1}/${maxRetries}):`, error);
    }
    
    // If we're not on the last attempt, wait before retrying
    if (attempt < maxRetries - 1) {
      const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 