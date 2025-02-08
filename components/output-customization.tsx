"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Instagram, Sparkles, Upload, X } from "lucide-react";
import { ColorPicker } from "@/components/color-picker";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import Image from "next/image";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2 } from "lucide-react";
import { useGeneration } from "@/lib/contexts/generation-context";

export function OutputCustomization() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { bulletPoints } = useGeneration();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type.startsWith('image/png') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/svg'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
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
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_content: "Your input content here", // You'll need to add an input field for this
          output_format: "linkedin" // Get this from your radio selection
        })
      });

      const data = await response.json();
      if (data.bulletPoints) {
        // Assuming you want to update the bullet points in the context
        // This is a placeholder and should be replaced with actual implementation
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Output</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Output Format</label>
          <RadioGroup defaultValue="linkedin" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <RadioGroupItem value="linkedin" id="linkedin" className="peer sr-only" />
              <Label
                htmlFor="linkedin"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Linkedin className="mb-2 h-6 w-6" />
                <span>LinkedIn Carousel</span>
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
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Style Presets */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Style Preset</label>
          <RadioGroup defaultValue="professional" className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* AI Analysis Preview - Show when bulletPoints exist */}
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
              {bulletPoints.map((point, index) => (
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
            <ColorPicker label="Primary Color" />
            <ColorPicker label="Secondary Color" />
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

        {/* Generate Button */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>✨ Generate Now</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

