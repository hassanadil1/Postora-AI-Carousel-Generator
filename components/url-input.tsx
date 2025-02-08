import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";

export function UrlInput() {
  return (
    <div className="space-y-4">
      <Input
        type="url"
        placeholder="Paste blog URL here..."
        className="w-full"
      />
      <Button className="w-full gap-2">
        <Import className="h-4 w-4" />
        Import Content
      </Button>
    </div>
  );
} 