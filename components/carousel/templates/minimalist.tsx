"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MinimalistTemplateProps {
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

export function MinimalistTemplate({
  bulletPoint,
  slideNumber,
  totalSlides,
  logo,
  primaryColor = "#171717",
  backgroundColor = "#ffffff",
  textColor = "#171717",
  fontFamily = "arial",
  showGradientBackground = false,
  gradientBackground,
}: MinimalistTemplateProps) {
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

  return (
    <div 
      className="w-full h-full flex flex-col p-10"
      style={{ 
        background: showGradientBackground && gradientBackground ? gradientBackground : backgroundColor,
        fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)`
      }}
    >
      {/* Minimal Header */}
      {logo && (
        <div className="flex justify-start mb-8">
          <div className="w-12 h-12 relative">
            <Image
              src={logo}
              alt="Company logo"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Centered Content */}
      <div className="flex-grow flex flex-col justify-center items-center text-center max-w-2xl mx-auto">
        <h2 
          className="text-4xl font-light mb-8 leading-tight"
          style={{ color: primaryColor }}
        >
          {heading || "No content"}
        </h2>
        {details && (
          <p 
            className="text-2xl font-light leading-relaxed"
            style={{ color: textColor }}
          >
            {details}
          </p>
        )}
      </div>

      {/* Minimal Footer - Without slide counter */}
      <div className="flex justify-start items-center mt-8">
        <div 
          className="w-12 h-0.5"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </div>
  );
} 