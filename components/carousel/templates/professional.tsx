"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProfessionalTemplateProps {
  bulletPoint: string;
  slideNumber: number;
  totalSlides: number;
  logo?: string;
  primaryColor: string;
  backgroundColor: string;
  textColor?: string;
  fontFamily?: string;
  showGradientBackground?: boolean;
  gradientBackground?: string;
}

export function ProfessionalTemplate({
  bulletPoint = "",
  slideNumber,
  totalSlides,
  logo,
  primaryColor = "#0f172a",
  backgroundColor = "#ffffff",
  textColor = "#000000",
  fontFamily = "arial",
  showGradientBackground = false,
  gradientBackground,
}: ProfessionalTemplateProps) {
  let heading = "";
  let details = "";
  
  if (bulletPoint && typeof bulletPoint === 'string') {
    if (bulletPoint.includes(':')) {
      const parts = bulletPoint.split(':', 2);
      heading = parts[0]?.trim() || "";
      details = parts[1]?.trim() || "";
    } else {
      heading = bulletPoint.trim();
    }
  }

  // Calculate a slightly darker color for the slide counter
  const slideCounterColor = "#64748b"; // Default secondary color for slide counter

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-10"
      style={{ 
        background: showGradientBackground && gradientBackground ? gradientBackground : backgroundColor,
        '--primary-color': primaryColor,
        '--text-color': textColor,
        fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)`
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        {logo && (
          <div className="w-16 h-16 relative">
            <Image
              src={logo}
              alt="Company logo"
              fill
              className="object-contain"
            />
          </div>
        )}
        <div 
          className="h-1 flex-grow ml-4 rounded-full" 
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Content - Centered both vertically and horizontally */}
      <div className="flex-grow flex flex-col justify-center my-4 text-center max-w-4xl mx-auto">
        <h2 
          className="text-4xl font-bold mb-6 leading-tight"
          style={{ color: primaryColor }}
        >
          {heading || "No content"}
        </h2>
        {details && (
          <p 
            className="text-2xl leading-relaxed"
            style={{ color: textColor }}
          >
            {details}
          </p>
        )}
      </div>

      {/* Footer - Without slide counter */}
      <div className="flex justify-end items-center">
        <div className="h-0.5 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
      </div>
    </div>
  );
} 