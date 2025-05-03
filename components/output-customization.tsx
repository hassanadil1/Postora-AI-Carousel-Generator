"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Instagram, Sparkles, Upload, X, Loader2 } from "lucide-react";
import { ColorPicker } from "@/components/color-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useGeneration } from "@/lib/contexts/generation-context";
import { useToast } from "@/hooks/use-toast";
import { FontSelector } from "@/components/font-selector";
import { storeData, getData, removeData, STORAGE_KEYS } from "@/lib/local-storage";

export function OutputCustomization() {
  const router = useRouter();
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { bulletPoints } = useGeneration();
  const [primaryColor, setPrimaryColor] = useState("#0f172a");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [outputFormat, setOutputFormat] = useState("linkedin");
  const [stylePreset, setStylePreset] = useState("professional");
  const [fontFamily, setFontFamily] = useState("arial");

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/png') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/svg'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        storeData(STORAGE_KEYS.LOGO, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/png') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/svg'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        storeData(STORAGE_KEYS.LOGO, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    removeData(STORAGE_KEYS.LOGO);
  };

  const handleGenerate = async () => {
    if (!bulletPoints || bulletPoints.length === 0) {
      toast({
        title: "No content generated",
        description: "Please generate bullet points first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Save to localStorage
      storeData(STORAGE_KEYS.STYLE, stylePreset);
      storeData(STORAGE_KEYS.PRIMARY_COLOR, primaryColor);
      storeData(STORAGE_KEYS.BACKGROUND_COLOR, backgroundColor);
      storeData(STORAGE_KEYS.TEXT_COLOR, textColor);
      storeData(STORAGE_KEYS.OUTPUT_FORMAT, outputFormat);
      storeData(STORAGE_KEYS.FONT_FAMILY, fontFamily);
      
      // Navigate to output page
      router.push('/output');
    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Load saved preferences
  useEffect(() => {
    const storedPrimaryColor = getData(STORAGE_KEYS.PRIMARY_COLOR);
    const storedBackgroundColor = getData(STORAGE_KEYS.BACKGROUND_COLOR);
    const storedTextColor = getData(STORAGE_KEYS.TEXT_COLOR);
    const storedOutputFormat = getData(STORAGE_KEYS.OUTPUT_FORMAT);
    const storedStylePreset = getData(STORAGE_KEYS.STYLE);
    const storedLogo = getData(STORAGE_KEYS.LOGO);
    const storedFontFamily = getData(STORAGE_KEYS.FONT_FAMILY);
    
    if (storedPrimaryColor) setPrimaryColor(storedPrimaryColor);
    if (storedBackgroundColor) setBackgroundColor(storedBackgroundColor);
    if (storedTextColor) setTextColor(storedTextColor);
    if (storedOutputFormat) setOutputFormat(storedOutputFormat);
    if (storedStylePreset) setStylePreset(storedStylePreset);
    if (storedLogo) setLogoPreview(storedLogo);
    if (storedFontFamily) setFontFamily(storedFontFamily);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Output</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Output Format</label>
          <RadioGroup 
            value={outputFormat}
            onValueChange={setOutputFormat}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="linkedin" id="linkedin" className="peer sr-only" />
              <Label
                htmlFor="linkedin"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Linkedin className="mb-2 h-6 w-6" />
                <span>LinkedIn Carousel</span>
                <span className="text-xs text-muted-foreground mt-1">1080×1080 px</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem value="twitter" id="twitter" className="peer sr-only" />
              <Label
                htmlFor="twitter"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Twitter className="mb-2 h-6 w-6" />
                <span>Twitter Thread</span>
                <span className="text-xs text-muted-foreground mt-1">1600×900 px</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="instagram" id="instagram" className="peer sr-only" />
              <Label
                htmlFor="instagram"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Instagram className="mb-2 h-6 w-6" />
                <span>Instagram Posts</span>
                <span className="text-xs text-muted-foreground mt-1">1080×1080 px</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Style Presets */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Style Preset</label>
          <RadioGroup 
            value={stylePreset}
            onValueChange={setStylePreset}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem value="professional" id="professional" className="peer sr-only" />
              <Label
                htmlFor="professional"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-lg font-medium">Professional</span>
                <span className="text-sm text-muted-foreground">Clean & corporate style</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="playful" id="playful" className="peer sr-only" />
              <Label
                htmlFor="playful"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-lg font-medium">Playful</span>
                <span className="text-sm text-muted-foreground">Fun & engaging design</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem value="minimalist" id="minimalist" className="peer sr-only" />
              <Label
                htmlFor="minimalist"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <span className="text-lg font-medium">Minimalist</span>
                <span className="text-sm text-muted-foreground">Simple & elegant look</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* AI Analysis Preview */}
        {bulletPoints && bulletPoints.length > 0 && (
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                AI-Generated Key Points
              </label>
              <span className="text-xs text-muted-foreground">Priority-based analysis</span>
            </div>
            
            <div className="space-y-3">
              {bulletPoints.slice(0, 10).map((point, index) => (
                <div 
                  key={index}
                  className="flex gap-3 items-start p-3 rounded-md bg-muted/50"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{point}</p>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full" 
                        style={{ width: `${(1 - (index * 0.1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Branding Options */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full">Branding Options</Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="w-full">
                <ColorPicker 
                  label="Primary Color" 
                  value={primaryColor}
                  onChange={(value) => {
                    setPrimaryColor(value);
                    storeData(STORAGE_KEYS.PRIMARY_COLOR, value);
                  }}
                />
              </div>
              <div className="w-full">
                <ColorPicker 
                  label="Background Color" 
                  value={backgroundColor}
                  onChange={(value) => {
                    setBackgroundColor(value);
                    storeData(STORAGE_KEYS.BACKGROUND_COLOR, value);
                  }}
                />
              </div>
              <div className="w-full">
                <ColorPicker 
                  label="Text Color" 
                  value={textColor}
                  onChange={(value) => {
                    setTextColor(value);
                    storeData(STORAGE_KEYS.TEXT_COLOR, value);
                  }}
                />
              </div>
            </div>
            
            {/* Font Selector */}
            <div className="w-full">
              <FontSelector
                value={fontFamily}
                onChange={(value) => {
                  setFontFamily(value);
                  storeData(STORAGE_KEYS.FONT_FAMILY, value);
                }}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Logo</label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleLogoDrop}
              >
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={handleLogoUpload}
                />
                
                {logoPreview ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Remove Logo
                    </Button>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your logo here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports: PNG, JPG, SVG
                    </p>
                  </label>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Preview Sample */}
        {bulletPoints && bulletPoints.length > 0 && (
          <div className="p-4 rounded-lg border bg-muted/20">
            <p className="text-sm text-muted-foreground mb-2">Preview (First Slide)</p>
            <div className={`aspect-${outputFormat === 'twitter' ? '[16/9]' : 'square'} rounded-md overflow-hidden shadow-sm`} style={{ backgroundColor }}>
              <div className="w-full h-full p-4 flex flex-col" style={{ fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)` }}>
                <div className="flex justify-between items-center">
                  {logoPreview && (
                    <div className="w-8 h-8 relative">
                      <Image
                        src={logoPreview}
                        alt="Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div 
                    className="h-1 flex-grow ml-2 rounded-full" 
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <h3 
                    className="text-xl font-bold mb-2"
                    style={{ color: primaryColor }}
                  >
                    {bulletPoints[0]?.split(':')[0] || bulletPoints[0]?.substring(0, 40)}
                  </h3>
                  <p style={{ color: textColor }}>
                    {bulletPoints[0]?.split(':')[1] || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleGenerate}
          disabled={isGenerating || !bulletPoints || bulletPoints.length === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>✨ Create Carousel</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}