"use client";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2, Eye, Grid3X3, List, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { 
  createCanvasTemplate, 
  generateSlideImage,
  type TemplateProps 
} from "@/lib/canvas-templates";

interface CanvasCarouselViewerProps {
  bulletPoints: string[];
  style: "professional" | "playful" | "minimalist";
  logo?: string;
  primaryColor: string;
  backgroundColor?: string;
  textColor?: string;
  outputFormat?: "linkedin" | "twitter" | "instagram";
  fontFamily?: string;
  backgroundImage?: string;
  backgroundImageOpacity?: number;
  textAlign?: "left" | "center" | "right";
}

interface SlidePreview {
  index: number;
  dataUrl: string;
  isLoading: boolean;
}

export function CanvasCarouselViewer({ 
  bulletPoints,
  style = "professional",
  logo,
  primaryColor,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  outputFormat = "linkedin",
  fontFamily = "arial",
  backgroundImage,
  backgroundImageOpacity = 0.3,
  textAlign = "center",
}: CanvasCarouselViewerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [slidePreviews, setSlidePreviews] = useState<SlidePreview[]>([]);
  const [selectedPreview, setSelectedPreview] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalSlides = bulletPoints?.length || 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize slide previews
  useEffect(() => {
    if (!isMounted || !bulletPoints || bulletPoints.length === 0) return;
    
    const initialPreviews: SlidePreview[] = bulletPoints.map((_, index) => ({
      index,
      dataUrl: "",
      isLoading: true
    }));
    setSlidePreviews(initialPreviews);
    
    // Generate current slide first, then others
    generateCurrentSlide();
  }, [isMounted, bulletPoints, style, primaryColor, backgroundColor, textColor, outputFormat, fontFamily, logo, backgroundImage, backgroundImageOpacity, textAlign]);

  // Generate current slide when changed
  useEffect(() => {
    if (slidePreviews.length > 0 && !slidePreviews[currentSlide]?.dataUrl) {
      generateSlidePreview(currentSlide);
    }
  }, [currentSlide]);

  const generateSlidePreview = async (slideIndex: number) => {
    if (!bulletPoints || slideIndex >= bulletPoints.length) return;

    try {
      const templateProps: TemplateProps = {
        bulletPoint: bulletPoints[slideIndex] || "",
        slideNumber: slideIndex + 1,
        totalSlides,
        logo,
        primaryColor,
        backgroundColor,
        textColor,
        fontFamily,
        backgroundImage,
        backgroundImageOpacity,
        outputFormat,
        textAlign
      };

      const dataUrl = await generateSlideImage(style, templateProps);
      
      setSlidePreviews(prev => prev.map(slide => 
        slide.index === slideIndex 
          ? { ...slide, dataUrl, isLoading: false }
          : slide
      ));

      if (slideIndex === currentSlide) {
        setSelectedPreview(dataUrl);
      }
    } catch (error) {
      console.error(`Error generating slide ${slideIndex}:`, error);
      setSlidePreviews(prev => prev.map(slide => 
        slide.index === slideIndex 
          ? { ...slide, isLoading: false }
          : slide
      ));
    }
  };

  const generateCurrentSlide = async () => {
    if (currentSlide < totalSlides) {
      await generateSlidePreview(currentSlide);
    }
  };

  const generateAllSlides = async () => {
    setIsGeneratingAll(true);
    try {
      for (let i = 0; i < totalSlides; i++) {
        if (!slidePreviews[i]?.dataUrl) {
          await generateSlidePreview(i);
        }
      }
    } catch (error) {
      console.error("Error generating all slides:", error);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const nextSlide = () => {
    const newSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newSlide);
    setSelectedPreview(slidePreviews[newSlide]?.dataUrl || "");
  };

  const prevSlide = () => {
    const newSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    setCurrentSlide(newSlide);
    setSelectedPreview(slidePreviews[newSlide]?.dataUrl || "");
  };

  const selectSlide = (index: number) => {
    setCurrentSlide(index);
    setSelectedPreview(slidePreviews[index]?.dataUrl || "");
    if (!slidePreviews[index]?.dataUrl) {
      generateSlidePreview(index);
    }
  };

  // Get platform info
  const getPlatformInfo = () => {
    switch (outputFormat) {
      case "twitter":
        return { name: "Twitter", dimensions: "1600×900px", ratio: "16:9" };
      case "instagram":
        return { name: "Instagram", dimensions: "1080×1080px", ratio: "1:1" };
      case "linkedin":
      default:
        return { name: "LinkedIn", dimensions: "1080×1080px", ratio: "1:1" };
    }
  };

  const exportCurrentSlide = async () => {
    const currentPreview = slidePreviews[currentSlide];
    if (!currentPreview?.dataUrl) return;
    
    setIsExporting(true);
    try {
      const response = await fetch(currentPreview.dataUrl);
      const blob = await response.blob();
      saveAs(blob, `slide-${currentSlide + 1}-${outputFormat}-${style}.png`);
    } catch (error) {
      console.error("Error exporting slide:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAllAsZip = async () => {
    setIsExportingAll(true);
    try {
      // First ensure all slides are generated
      await generateAllSlides();
      
      const zip = new JSZip();
      const slideFolder = zip.folder("carousel-slides");
      if (!slideFolder) return;

      for (let i = 0; i < totalSlides; i++) {
        const preview = slidePreviews[i];
        if (preview?.dataUrl) {
          const base64Data = preview.dataUrl.split(",")[1];
          slideFolder.file(`slide-${i + 1}-${outputFormat}-${style}.png`, base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${outputFormat}-carousel-${style}-${totalSlides}slides.zip`);
    } catch (error) {
      console.error("Error exporting all slides:", error);
    } finally {
      setIsExportingAll(false);
    }
  };

  const platformInfo = getPlatformInfo();

  if (!isMounted) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading Canvas Renderer...</p>
        </div>
      </div>
    );
  }

  if (!bulletPoints || bulletPoints.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3X3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
          <p className="text-muted-foreground">Generate content first to see carousel previews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Platform Info and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {platformInfo.name} • {platformInfo.dimensions}
          </Badge>
          <Badge variant="outline" className="text-sm capitalize">
            {style} Style
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
          >
            {viewMode === 'single' ? <Grid3X3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {viewMode === 'single' ? 'Grid View' : 'Single View'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={generateAllSlides}
            disabled={isGeneratingAll}
          >
            {isGeneratingAll ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            Generate All
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'single' | 'grid')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Single Preview
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            All Slides
          </TabsTrigger>
        </TabsList>

        {/* Single Slide View */}
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="relative flex justify-center">
                <div className={`${outputFormat === 'twitter' ? 'w-full max-w-2xl aspect-[16/9]' : 'w-full max-w-lg aspect-square'} bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center`}>
                  {selectedPreview || slidePreviews[currentSlide]?.dataUrl ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={selectedPreview || slidePreviews[currentSlide]?.dataUrl}
                        alt={`Slide ${currentSlide + 1} - Exact Export Preview`}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-black/70 text-white">
                          Exact Export Preview
                        </Badge>
                      </div>
                    </div>
                  ) : slidePreviews[currentSlide]?.isLoading ? (
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Generating high-quality image...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button onClick={() => generateSlidePreview(currentSlide)}>
                        Generate Preview
                      </Button>
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                {totalSlides > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg z-10"
                      onClick={prevSlide}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white shadow-lg z-10"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Slide Info and Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    Slide {currentSlide + 1} of {totalSlides}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    {bulletPoints[currentSlide]?.substring(0, 50)}...
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Full Size
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <div className="w-full max-h-[80vh] overflow-auto">
                        {selectedPreview && (
                          <img 
                            src={selectedPreview}
                            alt={`Slide ${currentSlide + 1} Full Size`}
                            className="w-full h-auto"
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCurrentSlide}
                    disabled={isExporting || !slidePreviews[currentSlide]?.dataUrl}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export
                  </Button>
                </div>
              </div>

              {/* Slide Navigation Dots */}
              {totalSlides > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  {bulletPoints.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSlide 
                          ? "bg-primary scale-110" 
                          : slidePreviews[index]?.dataUrl 
                            ? "bg-green-500" 
                            : "bg-gray-300"
                      }`}
                      onClick={() => selectSlide(index)}
                      title={`Slide ${index + 1}${slidePreviews[index]?.dataUrl ? ' (Ready)' : ' (Not generated)'}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {bulletPoints.map((point, index) => {
              const preview = slidePreviews[index];
              return (
                <Card key={index} className={`cursor-pointer transition-all hover:shadow-lg ${index === currentSlide ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-3">
                    <div className={`w-full ${outputFormat === 'twitter' ? 'aspect-[16/9]' : 'aspect-square'} bg-gray-100 rounded-md overflow-hidden mb-2`}>
                      {preview?.dataUrl ? (
                        <img 
                          src={preview.dataUrl}
                          alt={`Slide ${index + 1}`}
                          className="w-full h-full object-contain"
                          onClick={() => selectSlide(index)}
                        />
                      ) : preview?.isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => generateSlidePreview(index)}
                          >
                            Generate
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Slide {index + 1}</span>
                        {preview?.dataUrl && (
                          <Badge variant="secondary" className="text-xs">Ready</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {point.substring(0, 80)}...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export All Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="font-medium mb-1">Export All Slides</h3>
              <p className="text-sm text-muted-foreground">
                Download all {totalSlides} slides as high-quality PNG images in a ZIP file
              </p>
            </div>
            
            <Button
              onClick={exportAllAsZip}
              disabled={isExportingAll}
              className="shrink-0"
            >
              {isExportingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExportingAll ? 'Preparing ZIP...' : 'Download All as ZIP'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quality Info */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          High-Quality Canvas Rendering • {platformInfo.dimensions} • PNG Format
        </div>
      </div>
    </div>
  );
} 