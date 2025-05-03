"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumb } from "@/components/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Download, Linkedin, Loader2 } from "lucide-react";
import { getData, storeData, STORAGE_KEYS } from "@/lib/local-storage";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carouselshadcn";

// Import browser-only libraries properly
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import JSZip from "jszip";

// Import the template components
import { ProfessionalTemplate } from "@/components/carousel/templates/professional";
import { PlayfulTemplate } from "@/components/carousel/templates/playful";
import { MinimalistTemplate } from "@/components/carousel/templates/minimalist";

export default function OutputPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize with empty arrays/values to match server rendering
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [style, setStyle] = useState<"professional" | "playful" | "minimalist">("professional");
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [outputFormat, setOutputFormat] = useState<"linkedin" | "twitter" | "instagram">("linkedin");
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [fontFamily, setFontFamily] = useState("arial");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

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
      // Get from localStorage using our utilities
      const storedBulletPoints = getData(STORAGE_KEYS.BULLET_POINTS, []);
      const storedStyle = getData(STORAGE_KEYS.STYLE, "professional");
      const storedPrimaryColor = getData(STORAGE_KEYS.PRIMARY_COLOR, "#0f172a");
      const storedBackgroundColor = getData(STORAGE_KEYS.BACKGROUND_COLOR, "#ffffff");
      const storedTextColor = getData(STORAGE_KEYS.TEXT_COLOR, "#000000");
      const storedOutputFormat = getData(STORAGE_KEYS.OUTPUT_FORMAT, "linkedin");
      const storedLogo = getData(STORAGE_KEYS.LOGO);
      const storedFontFamily = getData(STORAGE_KEYS.FONT_FAMILY, "arial");
      
      if (storedBulletPoints && Array.isArray(storedBulletPoints) && storedBulletPoints.length > 0) {
        setBulletPoints(storedBulletPoints);
        
        // Set other properties
        if (storedStyle && ["professional", "playful", "minimalist"].includes(storedStyle)) {
          setStyle(storedStyle as "professional" | "playful" | "minimalist");
        }
        if (storedPrimaryColor) setPrimaryColor(storedPrimaryColor);
        if (storedBackgroundColor) setBackgroundColor(storedBackgroundColor);
        if (storedTextColor) setTextColor(storedTextColor);
        if (storedOutputFormat && ["linkedin", "twitter", "instagram"].includes(storedOutputFormat)) {
          setOutputFormat(storedOutputFormat as "linkedin" | "twitter" | "instagram");
        }
        if (storedLogo) setLogo(storedLogo);
        if (storedFontFamily) setFontFamily(storedFontFamily);
        
        setHasData(true);
      } else {
        // No valid data
        setHasData(false);
      }
    } catch (e) {
      console.error("Error accessing storage:", e);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  const shareToLinkedIn = () => {
    // Would be implemented with LinkedIn API
    alert("LinkedIn sharing would be implemented with their API");
  };

  // Get the aspect ratio based on the platform
  const getAspectRatio = () => {
    switch (outputFormat) {
      case "twitter":
        return "aspect-[16/9]"; // Twitter recommended: 1600x900
      case "instagram":
      case "linkedin":
      default:
        return "aspect-square"; // Instagram/LinkedIn recommended: 1080x1080
    }
  };

  // Get the dimensions for export
  const getExportDimensions = () => {
    switch (outputFormat) {
      case "twitter":
        return { width: 1600, height: 900 };
      case "instagram":
      case "linkedin":
      default:
        return { width: 1080, height: 1080 };
    }
  };

  // Create a gradient background from the primary and background colors
  const getGradientBackground = () => {
    // Extract RGB components from hex colors
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Convert RGB to rgba string with opacity
    const rgbaString = (hex: string, opacity: number) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return hex;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    };

    // Create a more dynamic gradient based on the style
    switch (style) {
      case "professional":
        // Subtle diagonal gradient
        return `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor} 70%, ${rgbaString(primaryColor, 0.15)} 100%)`;
      case "playful":
        // More playful radial gradient
        return `radial-gradient(circle at bottom right, ${rgbaString(primaryColor, 0.2)} 0%, ${backgroundColor} 50%)`;
      case "minimalist":
        // Very subtle linear gradient
        return `linear-gradient(to bottom, ${backgroundColor} 0%, ${rgbaString(primaryColor, 0.08)} 100%)`;
      default:
        return `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor} 70%, ${rgbaString(primaryColor, 0.15)} 100%)`;
    }
  };

  // Render the appropriate template for the slide
  const renderTemplate = (slideIndex: number) => {
    const props = {
      bulletPoint: bulletPoints[slideIndex] || "",
      slideNumber: slideIndex + 1,
      totalSlides: bulletPoints.length,
      logo,
      primaryColor,
      backgroundColor,
      textColor,
      fontFamily,
      showGradientBackground: true,
      gradientBackground: getGradientBackground()
    };

    switch (style) {
      case "professional":
        return <ProfessionalTemplate {...props} />;
      case "playful":
        return <PlayfulTemplate {...props} />;
      case "minimalist":
        return <MinimalistTemplate {...props} />;
      default:
        return <ProfessionalTemplate {...props} />;
    }
  };

  // Export current slide as PNG
  const exportCurrentSlide = async () => {
    if (!isMounted) return;
    
    setIsExporting(true);
    try {
      const slideElement = document.getElementById(`carousel-slide-${currentSlide}`);
      if (!slideElement) {
        console.error("Slide element not found");
        return;
      }

      const dimensions = getExportDimensions();
      
      // Create a temporary container with exact dimensions to fix aspect ratio issues
      const container = document.createElement('div');
      container.style.width = `${dimensions.width}px`;
      container.style.height = `${dimensions.height}px`;
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.background = 'transparent';
      
      // Clone the slide to the temporary container
      const clone = slideElement.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.height = '100%';
      container.appendChild(clone);
      document.body.appendChild(container);
      
      // Use html2canvas with better options
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: dimensions.width,
        height: dimensions.height,
        imageTimeout: 0,
        logging: false
      });
      
      // Clean up temporary elements
      document.body.removeChild(container);
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `slide-${currentSlide + 1}-${outputFormat}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting slide:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Export all slides as a ZIP file
  const exportAllSlides = async () => {
    if (!isMounted) return;
    
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const dimensions = getExportDimensions();
      const slideFolder = zip.folder("slides");
      
      if (!slideFolder) {
        console.error("Could not create folder in zip");
        return;
      }

      // Export each slide one by one
      for (let i = 0; i < bulletPoints.length; i++) {
        const slideElement = document.getElementById(`carousel-slide-${i}`);
        if (!slideElement) continue;
        
        // Create a temporary container with exact dimensions
        const container = document.createElement('div');
        container.style.width = `${dimensions.width}px`;
        container.style.height = `${dimensions.height}px`;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.background = 'transparent';
        
        // Clone the slide to the temporary container
        const clone = slideElement.cloneNode(true) as HTMLElement;
        clone.style.width = '100%';
        clone.style.height = '100%';
        container.appendChild(clone);
        document.body.appendChild(container);
        
        // Use html2canvas with better options
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          width: dimensions.width,
          height: dimensions.height,
          imageTimeout: 0,
          logging: false
        });
        
        // Clean up
        document.body.removeChild(container);
        
        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.split(",")[1];
        slideFolder.file(`slide-${i + 1}-${outputFormat}.png`, base64Data, { base64: true });
      }

      // Generate and download the ZIP file
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${outputFormat}-carousel-slides.zip`);
    } catch (error) {
      console.error("Error exporting all slides:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // If we're loading or there's data being processed, show loading state
  if (!isMounted || isLoading) {
    return (
      <main className="container py-10 max-w-6xl mx-auto px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  // If there's no data, show message prompting user to create content
  if (!hasData) {
    return (
      <main className="container py-10 max-w-6xl mx-auto px-4">
        <Breadcrumb />
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Carousel Data Found</h1>
          <p className="text-muted-foreground mb-6">
            It looks like you haven't generated any content yet. 
            Start by creating a carousel from the content generation page.
          </p>
          <Button asChild>
            <Link href="/create">Create Carousel</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Main content view with carousel
  return (
    <main className="container py-10 max-w-6xl mx-auto px-4">
      <Breadcrumb />
      
      <h1 className="text-3xl font-bold mb-8">Your Carousel</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Carousel implementation using Shadcn */}
        <div className="w-full max-w-3xl mx-auto">
          <Carousel className="mx-auto" setApi={(api) => {
            api?.on("select", () => {
              setCurrentSlide(api.selectedScrollSnap());
            });
          }}>
            <CarouselContent>
              {bulletPoints.map((point, index) => (
                <CarouselItem key={index}>
                  <div className={`${getAspectRatio()} w-full rounded-md overflow-hidden border shadow-lg`} id={`carousel-slide-${index}`}>
                    {renderTemplate(index)}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          
          <div className="flex justify-center mt-6 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportCurrentSlide}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Current Slide
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportAllSlides}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export All Slides
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="edit" className="w-full max-w-3xl mx-auto mt-8">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit">Edit Text</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
          
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
                      // Update storage with new bullet points
                      storeData(STORAGE_KEYS.BULLET_POINTS, newPoints);
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