import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
      <Link href="/" className="flex items-center gap-1 hover:text-foreground">
        <Home className="h-4 w-4" />
        Home
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground">Create</span>
    </div>
  );
} 