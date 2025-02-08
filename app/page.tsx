import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText, Megaphone, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Turn Long Content into Scroll-Stopping Carousels 🚀
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Paste a blog, upload a speech, or drag-and-drop files to get AI-designed social media posts in seconds.
        </p>
        
        <SignedIn>
          <Link href="/create">
            <Button size="lg" className="gap-2">
              Start Creating <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </SignedIn>
        
        <SignedOut>
          <div className="flex gap-4">
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </SignedOut>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Blog-to-Carousel</CardTitle>
                <CardDescription>
                  Transform lengthy blog posts into engaging carousel slides automatically
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Megaphone className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>Speech-to-Post</CardTitle>
                <CardDescription>
                  Convert speeches and presentations into social-ready content
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Palette className="h-12 w-12 mb-4 text-primary" />
                <CardTitle>1-Click Branding</CardTitle>
                <CardDescription>
                  Apply your brand colors and style with a single click
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Get 3 Free Carousels Monthly</h2>
          <div className="max-w-md mx-auto">
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
