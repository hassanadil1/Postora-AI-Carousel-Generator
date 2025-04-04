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
  secondaryColor: string;
}

export function CarouselViewer({ 
  bulletPoints,
  style = "professional",
  logo,
  primaryColor,
  secondaryColor,
}: CarouselViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = bulletPoints?.length || 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides ? 1 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 1 ? totalSlides : prev - 1));
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
      secondaryColor,
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
      const canvas = await html2canvas(slideElement, {
        scale: 2,
        backgroundColor: null,
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `slide-${currentSlide}.png`;
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
        });
        
        const dataUrl = canvas.toDataURL("image/png");
        const base64Data = dataUrl.split(",")[1];
        
        slideFolder.file(`slide-${i}.png`, base64Data, { base64: true });
      }

      // Restore current slide
      setCurrentSlide(currentSlideBackup);

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "carousel-slides.zip");
    } catch (error) {
      console.error("Error exporting all slides:", error);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-2xl aspect-[16/9] rounded-lg overflow-hidden border shadow-lg flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!bulletPoints || bulletPoints.length === 0) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-2xl aspect-[16/9] rounded-lg overflow-hidden border shadow-lg flex items-center justify-center bg-muted">
          <p className="text-muted-foreground">No content to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="w-full max-w-2xl aspect-[16/9] rounded-lg overflow-hidden border shadow-lg">
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