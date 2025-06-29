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
  backgroundImage?: string;
  backgroundImageOpacity?: number;
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
  backgroundImage,
  backgroundImageOpacity = 0.3,
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

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-8 relative"
      style={{ 
        backgroundColor,
        '--primary-color': primaryColor,
        '--text-color': textColor,
        fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)`
      } as React.CSSProperties}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: backgroundImageOpacity
          }}
        />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          {logo && (
            <div className="w-12 h-12 relative">
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

        {/* Content - Perfectly Centered */}
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 leading-tight max-w-full"
            style={{ color: primaryColor }}
          >
            {heading || "No content"}
          </h2>
          {details && (
            <p 
              className="text-lg md:text-xl leading-relaxed max-w-4xl"
              style={{ color: textColor }}
            >
              {details}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {slideNumber} / {totalSlides}
          </div>
          <div className="h-0.5 w-16 rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>
    </div>
  );
} 