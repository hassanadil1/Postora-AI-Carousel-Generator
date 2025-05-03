"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfessionalTemplate } from "./templates/professional";
import { PlayfulTemplate } from "./templates/playful";
import { MinimalistTemplate } from "./templates/minimalist";

// Import browser-only libraries properly
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import JSZip from "jszip";

interface CarouselViewerProps {
  bulletPoints: string[];
  style: "professional" | "playful" | "minimalist";
  logo?: string;
  primaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  outputFormat?: "linkedin" | "twitter" | "instagram";
  fontFamily?: string;
}

export function CarouselViewer({ 
  bulletPoints,
  style = "professional",
  logo,
  primaryColor,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  outputFormat = "linkedin",
  fontFamily = "arial",
}: CarouselViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = bulletPoints?.length || 0;
  const [currentFormat, setCurrentFormat] = useState<"linkedin" | "twitter" | "instagram">(outputFormat);
  const [currentFont, setCurrentFont] = useState(fontFamily);

  useEffect(() => {
    setIsMounted(true);
    
    // Load the output format from localStorage if not provided
    if (!outputFormat) {
      const storedFormat = localStorage.getItem("outputFormat");
      if (storedFormat === "linkedin" || storedFormat === "twitter" || storedFormat === "instagram") {
        setCurrentFormat(storedFormat as "linkedin" | "twitter" | "instagram");
      }
    }

    // Load the font family from localStorage if not provided
    if (!fontFamily) {
      const storedFont = localStorage.getItem("fontFamily");
      if (storedFont) {
        setCurrentFont(storedFont);
      }
    }
  }, [outputFormat, fontFamily]);

  // Keep currentFormat updated when the prop changes
  useEffect(() => {
    if (outputFormat) {
      setCurrentFormat(outputFormat);
    }
    if (fontFamily) {
      setCurrentFont(fontFamily);
    }
  }, [outputFormat, fontFamily]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides ? 1 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 1 ? totalSlides : prev - 1));
  };

  // Get the aspect ratio based on the platform
  const getAspectRatio = () => {
    switch (currentFormat) {
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
    switch (currentFormat) {
      case "twitter":
        return { width: 1600, height: 900 };
      case "instagram":
      case "linkedin":
      default:
        return { width: 1080, height: 1080 };
    }
  };

  const renderTemplate = () => {
    if (!bulletPoints || bulletPoints.length === 0 || currentSlide > bulletPoints.length) {
      return <div className="flex items-center justify-center h-full">No content to display</div>;
    }

    const props = {
      bulletPoint: bulletPoints[currentSlide - 1] || "",
      slideNumber: currentSlide,
      totalSlides,
      logo,
      primaryColor,
      backgroundColor,
      textColor,
      fontFamily: currentFont,
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

  const exportAsPNG = async () => {
    if (!isMounted) return;
    
    const slideElement = document.getElementById("carousel-slide");
    if (!slideElement) return;

    try {
      const dimensions = getExportDimensions();
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        backgroundColor: null,
        width: dimensions.width,
        height: dimensions.height
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `slide-${currentSlide}-${currentFormat}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting slide:", error);
    }
  };

  const exportAllAsZip = async () => {
    if (!isMounted) return;
    
    const slideElement = document.getElementById("carousel-slide");
    if (!slideElement) return;

    try {
      const zip = new JSZip();
      const currentSlideBackup = currentSlide;
      const dimensions = getExportDimensions();

      // Create a folder for the slides
      const slideFolder = zip.folder("slides");
      if (!slideFolder) return;

      for (let i = 1; i <= totalSlides; i++) {
        setCurrentSlide(i);
        
        // Wait for the render to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(slideElement, {
          scale: 2,
          backgroundColor: null,
          width: dimensions.width,
          height: dimensions.height
        });
        
        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.split(",")[1];
        
        slideFolder.file(`slide-${i}-${currentFormat}.png`, base64Data, { base64: true });
      }

      // Restore current slide
      setCurrentSlide(currentSlideBackup);

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${currentFormat}-carousel-slides.zip`);
    } catch (error) {
      console.error("Error exporting all slides:", error);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className={`w-full max-w-2xl ${getAspectRatio()} rounded-lg overflow-hidden border shadow-lg flex items-center justify-center`}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!bulletPoints || bulletPoints.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className={`w-full max-w-2xl ${getAspectRatio()} rounded-lg overflow-hidden border shadow-lg flex items-center justify-center bg-muted`}>
          <p className="text-muted-foreground">No content to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className={`w-full max-w-2xl ${getAspectRatio()} rounded-lg overflow-hidden border shadow-lg`}>
        <div id="carousel-slide" className="w-full h-full">
          {renderTemplate()}
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-2xl">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevSlide}
          disabled={totalSlides <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm text-muted-foreground">
          {currentSlide} of {totalSlides}
        </span>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextSlide}
          disabled={totalSlides <= 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={exportAsPNG}
          className="flex items-center gap-2"
          disabled={totalSlides === 0}
        >
          <Download className="h-4 w-4" />
          Export Current Slide
        </Button>
        
        <Button 
          onClick={exportAllAsZip}
          className="flex items-center gap-2"
          disabled={totalSlides === 0}
        >
          <Download className="h-4 w-4" />
          Export All Slides
        </Button>
      </div>
    </div>
  );
} 