"use client";
import { ContentInput } from "@/components/content-input";
import { OutputCustomization } from "@/components/output-customization";
import { Breadcrumb } from "@/components/breadcrumb";
import { GenerationProvider } from "@/lib/contexts/generation-context";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CreatePage() {
  // Use this to prevent rendering anything meaningful during SSR
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return a minimal placeholder during SSR
  if (!isMounted) {
    return <div id="create-page-loading"></div>;
  }

  // Only render the full content on the client
  return (
    <GenerationProvider>
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create Your Carousel</h1>
          <div className="space-y-8">
            <ContentInput />
            <OutputCustomization />
          </div>
        </div>
      </main>
    </GenerationProvider>
  );
} 