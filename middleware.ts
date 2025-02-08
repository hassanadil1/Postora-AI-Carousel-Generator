import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// List of routes that should be protected (require authentication)
const protectedRoutes = createRouteMatcher(["/create", "/templates"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, getToken } = await auth();
  

  // If user is authenticated, ensure they exist in Supabase
  if (userId) {
    try {
      const response = await fetch(`${req.nextUrl.origin}/api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        }
      });


      if (!response.ok) {
        console.error('Failed to sync user:', await response.text());
      }
    } catch (error) {
      console.error('Error syncing user:', error);
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

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 