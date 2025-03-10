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
import { Input } from "@/components/ui/input";

export function ContentInput() {
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [url, setUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
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

  const extractContentFromUrl = async () => {
    if (!url || !url.trim()) {
      toast({
        title: "URL missing",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsExtracting(true);
    try {
      const response = await fetch('/api/extract-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract content from URL');
      }

      const data = await response.json();
      setContent(data.content);
      
      toast({
        title: "Content extracted",
        description: "Blog content has been successfully extracted",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to extract content from the URL",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
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
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Import URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
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

          <TabsContent value="url">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Enter blog URL (e.g., https://example.com/blog-post)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={extractContentFromUrl}
                    disabled={isExtracting || !url.trim()}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      'Import Text'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll extract the main content from the blog article
                </p>
              </div>
              
              <Textarea
                placeholder="Extracted content will appear here..."
                className="min-h-[250px] mb-4"
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
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <p className="text-xl font-medium text-muted-foreground mb-2">Coming Soon</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                File upload functionality will be available in a future update. For now, please use the "Write Here" or "Import URL" options.
              </p>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}