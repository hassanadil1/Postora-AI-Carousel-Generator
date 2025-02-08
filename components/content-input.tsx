"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { UrlInput } from "@/components/url-input";
import { PenLine, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeneration } from "@/lib/contexts/generation-context";

export function ContentInput() {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { setBulletPoints } = useGeneration();

  const handleGenerate = async () => {
    if (content.length < 100) {
      toast({
        title: "Content too short",
        description: "Please enter at least 100 characters",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate bullet points');
      }

      const data = await response.json();
      console.log('Generated bullets:', data.bulletPoints);
      
      setBulletPoints(data.bulletPoints.map((item: any) => item.point));
      
      toast({
        title: "Success!",
        description: "Bullet points generated successfully",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate bullet points",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="write" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            Write Here
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Import URL
          </TabsTrigger>
        </TabsList>

        <CardContent>
          <TabsContent value="write">
            <Textarea
              placeholder="Paste your blog, essay, or speech here... (Min. 100 characters)"
              className="min-h-[300px] mb-4"  
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {content.length} characters (minimum 100)
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || content.length < 100}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Bullets'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <FileUpload />
          </TabsContent>

          <TabsContent value="url">
            <UrlInput />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
} 