import { ContentInput } from "@/components/content-input";
import { OutputCustomization } from "@/components/output-customization";
import { Breadcrumb } from "@/components/breadcrumb";
import { GenerationProvider } from "@/lib/contexts/generation-context";

export default function CreatePage() {
  return (
    <GenerationProvider>
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create Your Carousel</h1>
          <div className="space-y-8">
            <ContentInput />
            <OutputCustomization />
          </div>
        </div>
      </main>
    </GenerationProvider>
  );
} 