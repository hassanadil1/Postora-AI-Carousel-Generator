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
  backgroundImage?: string;
  backgroundImageOpacity?: number;
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
  backgroundImage,
  backgroundImageOpacity = 0.3,
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
      className="w-full h-full flex flex-col p-8 relative"
      style={{ 
        backgroundColor,
        fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)`
      }}
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
        {/* Minimal Header */}
        <div className="flex justify-between items-center mb-4">
          {logo && (
            <div className="w-10 h-10 relative">
              <Image
                src={logo}
                alt="Company logo"
                fill
                className="object-contain"
              />
            </div>
          )}
          <div 
            className="w-12 h-0.5"
            style={{ backgroundColor: primaryColor }}
          />
        </div>

        {/* Perfectly Centered Content */}
        <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
          <h2 
            className="text-3xl md:text-4xl font-light mb-4 leading-tight max-w-full"
            style={{ color: primaryColor }}
          >
            {heading || "No content"}
          </h2>
          {details && (
            <p 
              className="text-lg md:text-xl font-light leading-relaxed max-w-4xl"
              style={{ color: textColor }}
            >
              {details}
            </p>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500 font-light">
            {slideNumber} / {totalSlides}
          </div>
          <div 
            className="w-8 h-0.5"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
    </div>
  );
} 