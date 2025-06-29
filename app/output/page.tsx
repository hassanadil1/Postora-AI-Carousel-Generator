"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Linkedin, Loader2, Palette, Settings, Share2, Edit3, Sparkles, Trash2, Plus } from "lucide-react";
import { getData, storeData, STORAGE_KEYS } from "@/lib/local-storage";
import { useToast } from "@/hooks/use-toast";

// Import the Canvas-based carousel viewer
import { CanvasCarouselViewer } from "@/components/carousel/canvas-carousel-viewer";

export default function OutputPage() {
  const router = useRouter();
  const { toast } = useToast();
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
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);
  const [backgroundImageOpacity, setBackgroundImageOpacity] = useState(0.3);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");

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
      const storedBackgroundImage = getData(STORAGE_KEYS.BACKGROUND_IMAGE);
      const storedBackgroundImageOpacity = getData(STORAGE_KEYS.BACKGROUND_IMAGE_OPACITY, 0.3);
      const storedFontFamily = getData(STORAGE_KEYS.FONT_FAMILY, "arial");
      const storedTextAlign = getData(STORAGE_KEYS.TEXT_ALIGN, "center");
      
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
        if (storedBackgroundImage) setBackgroundImage(storedBackgroundImage);
        if (storedBackgroundImageOpacity !== null) setBackgroundImageOpacity(storedBackgroundImageOpacity);
        if (storedFontFamily) setFontFamily(storedFontFamily);
        if (storedTextAlign) setTextAlign(storedTextAlign);
        
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
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out my carousel created with Postora! ${bulletPoints.length} professional slides ready to engage.`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually",
        variant: "destructive",
      });
    }
  };

  const copyAllText = async () => {
    try {
      const allText = bulletPoints.join('\n\n---\n\n');
      await navigator.clipboard.writeText(allText);
      toast({
        title: "Text copied!",
        description: "All slide content has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the text manually",
        variant: "destructive",
      });
    }
  };

  // If we're loading or there's data being processed, show loading state
  if (!isMounted || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-10 max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Loading Your Carousel</h2>
              <p className="text-muted-foreground">Preparing Canvas renderer...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // If there's no data, show message prompting user to create content
  if (!hasData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container py-10 max-w-6xl mx-auto px-4">
          <Breadcrumb />
          <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Ready to Create?</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              It looks like you haven&apos;t generated any content yet. 
              Let&apos;s create your first high-quality carousel!
            </p>
            <Button asChild size="lg" className="shadow-lg">
              <Link href="/create">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Creating
              </Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Main content view with Canvas-based carousel
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container py-6 max-w-7xl mx-auto px-4">
        <Breadcrumb />
        
        <div className="space-y-12">
          {/* Hero Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Canvas-Powered • High Quality</span>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Your Carousel is Ready
            </h1>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {bulletPoints.length} professionally designed slides, optimized for {outputFormat.toUpperCase()}, 
              ready to engage your audience.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {bulletPoints.length} Slides
              </Badge>
              <Badge variant="outline" className="text-sm">
                {outputFormat.toUpperCase()} Format
              </Badge>
              <Badge variant="outline" className="text-sm capitalize">
                {style} Style
              </Badge>
            </div>
          </div>

          {/* Main Carousel Section */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Palette className="h-6 w-6" />
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    These are the exact images that will be downloaded
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/create')}
                  className="shrink-0"
                  size="lg"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Design
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <CanvasCarouselViewer
                bulletPoints={bulletPoints}
                style={style}
                logo={logo}
                primaryColor={primaryColor}
                backgroundColor={backgroundColor}
                textColor={textColor}
                outputFormat={outputFormat}
                fontFamily={fontFamily}
                backgroundImage={backgroundImage}
                backgroundImageOpacity={backgroundImageOpacity}
                textAlign={textAlign}
              />
            </CardContent>
          </Card>

          {/* Content Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Edit Content - Now gets more space */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Edit3 className="h-6 w-6" />
                    Edit Slide Content
                  </CardTitle>
                  <CardDescription className="text-base">
                    Make changes to your slide text. Updates will be reflected in real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {bulletPoints.map((point, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <span>Slide {index + 1}</span>
                            <Badge variant="outline" className="text-sm">
                              {point.length} characters
                            </Badge>
                          </label>
                          {bulletPoints.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newPoints = bulletPoints.filter((_, i) => i !== index);
                                setBulletPoints(newPoints);
                                storeData(STORAGE_KEYS.BULLET_POINTS, newPoints);
                              }}
                              className="text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                        <textarea
                          value={point}
                          onChange={(e) => {
                            const newPoints = [...bulletPoints];
                            newPoints[index] = e.target.value;
                            setBulletPoints(newPoints);
                            storeData(STORAGE_KEYS.BULLET_POINTS, newPoints);
                          }}
                          className="w-full h-32 p-4 text-base rounded-lg border-2 border-gray-200 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="Enter slide content..."
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Add New Slide Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newPoints = [...bulletPoints, ""];
                        setBulletPoints(newPoints);
                        storeData(STORAGE_KEYS.BULLET_POINTS, newPoints);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Slide
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Actions Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 text-base"
                    onClick={() => router.push('/create')}
                  >
                    <Edit3 className="h-5 w-5 mr-3" />
                    Edit Design Settings
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 text-base"
                    onClick={copyAllText}
                  >
                    <Copy className="h-5 w-5 mr-3" />
                    Copy All Text
                  </Button>
                </CardContent>
              </Card>

              {/* Share Section */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share & Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 text-base"
                    onClick={copyShareLink}
                  >
                    <Copy className="h-5 w-5 mr-3" />
                    Copy Share Link
                  </Button>
                  
                  <Button 
                    className="w-full justify-start h-12 text-base bg-[#0077B5] hover:bg-[#005885]"
                    onClick={shareToLinkedIn}
                  >
                    <Linkedin className="h-5 w-5 mr-3" />
                    Share on LinkedIn
                  </Button>
                </CardContent>
              </Card>

              {/* Content Stats */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Content Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Slides</span>
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {bulletPoints.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Length</span>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {Math.round(bulletPoints.reduce((acc, point) => acc + point.length, 0) / bulletPoints.length)} chars
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platform</span>
                    <Badge className="text-base px-3 py-1">
                      {outputFormat.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-3">{bulletPoints.length}</div>
                <div className="text-base text-muted-foreground font-medium">Total Slides</div>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-green-600 mb-3">
                  {outputFormat === 'twitter' ? '1600×900' : '1080×1080'}
                </div>
                <div className="text-base text-muted-foreground font-medium">Resolution (px)</div>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-blue-600 mb-3 capitalize">{style}</div>
                <div className="text-base text-muted-foreground font-medium">Design Style</div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-purple-600 mb-3">PNG</div>
                <div className="text-base text-muted-foreground font-medium">Export Format</div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <Card className="shadow-xl border-0 bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Share Your Story?</h3>
                <p className="text-primary-foreground/90 max-w-2xl mx-auto">
                  Your carousel is optimized for maximum engagement. Download and share across your social platforms 
                  to start conversations and grow your audience.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={() => router.push('/create')}
                    className="shadow-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Another
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={shareToLinkedIn}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 shadow-lg"
                  >
                    <Linkedin className="mr-2 h-5 w-5" />
                    Share Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} 