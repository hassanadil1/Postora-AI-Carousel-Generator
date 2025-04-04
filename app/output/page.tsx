"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { CarouselViewer } from "@/components/carousel/carousel-viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Linkedin, Loader2 } from "lucide-react";

export default function OutputPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize with empty arrays/values to match server rendering
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [style, setStyle] = useState<"professional" | "playful" | "minimalist">("professional");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  // Use a separate effect for client-side operations
  useEffect(() => {
    // Mark as mounted first
    setIsMounted(true);

    // Delay accessing localStorage/browser APIs
    setTimeout(() => {
      loadDataFromStorage();
    }, 0);
  }, []);

  // Separate function to load data from storage
  const loadDataFromStorage = () => {
    setIsLoading(true);
    
    try {
      // Get from localStorage
      const storedBulletPoints = localStorage.getItem("bulletPoints");
      const storedStyle = localStorage.getItem("style");
      const storedPrimaryColor = localStorage.getItem("primaryColor");
      const storedSecondaryColor = localStorage.getItem("secondaryColor");
      const storedLogo = localStorage.getItem("logo");
      
      if (storedBulletPoints) {
        try {
          const parsedPoints = JSON.parse(storedBulletPoints);
          if (parsedPoints && Array.isArray(parsedPoints) && parsedPoints.length > 0) {
            setBulletPoints(parsedPoints);
            if (storedStyle) {
              setStyle(storedStyle as "professional" | "playful" | "minimalist");
            }
            if (storedPrimaryColor) setPrimaryColor(storedPrimaryColor);
            if (storedSecondaryColor) setSecondaryColor(storedSecondaryColor);
            if (storedLogo) setLogo(storedLogo);
            setHasData(true);
          } else {
            // No valid data
            setHasData(false);
          }
        } catch (e) {
          console.error("Error parsing stored bullet points:", e);
          setHasData(false);
        }
      } else {
        // No stored data
        setHasData(false);
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const shareToLinkedIn = () => {
    // Would be implemented with LinkedIn API
    alert("LinkedIn sharing would be implemented with their API");
  };

  // Show loading state while waiting for client-side operations
  if (!isMounted || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  // No data found, show error and link back to create
  if (!hasData) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No carousel data found</h2>
          <p className="text-muted-foreground mb-8">
            Please go back to the creation page and generate content first.
          </p>
          <Button asChild>
            <Link href="/create">Back to Create</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Has data, render the carousel
  return (
    <main className="container mx-auto px-4 py-8">
      <Breadcrumb />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Carousel</h1>
        
        <Tabs defaultValue="preview" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit Text</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="py-4">
            {bulletPoints.length > 0 && (
              <CarouselViewer 
                bulletPoints={bulletPoints}
                style={style}
                logo={logo}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            )}
          </TabsContent>
          
          <TabsContent value="edit" className="py-4">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Edit Bullet Points</h2>
              {bulletPoints.map((point, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium">
                    Bullet Point {index + 1}
                  </label>
                  <textarea
                    value={point}
                    onChange={(e) => {
                      const newPoints = [...bulletPoints];
                      newPoints[index] = e.target.value;
                      setBulletPoints(newPoints);
                      localStorage.setItem("bulletPoints", JSON.stringify(newPoints));
                    }}
                    className="w-full min-h-[100px] p-3 rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="py-4">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Share Your Carousel</h2>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={shareToLinkedIn}
                >
                  <Linkedin className="h-4 w-4" />
                  Share to LinkedIn
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
} 