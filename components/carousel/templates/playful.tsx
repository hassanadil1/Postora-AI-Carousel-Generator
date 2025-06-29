"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PlayfulTemplateProps {
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

export function PlayfulTemplate({
  bulletPoint,
  slideNumber,
  totalSlides,
  logo,
  primaryColor = "#6d28d9",
  backgroundColor = "#ffffff",
  textColor = "#4b5563",
  fontFamily = "arial",
  backgroundImage,
  backgroundImageOpacity = 0.3,
}: PlayfulTemplateProps) {
  // Extract heading and details
  const [heading, details] = bulletPoint?.includes(':') 
    ? bulletPoint.split(':', 2)
    : [bulletPoint, ''];

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-8 rounded-2xl relative"
      style={{ 
        backgroundColor,
        borderColor: primaryColor,
        borderWidth: '3px',
        fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)`
      }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-2xl"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            opacity: backgroundImageOpacity
          }}
        />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
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
          <div className="flex space-x-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full",
                  i === slideNumber - 1 
                    ? "opacity-100" 
                    : "opacity-40"
                )}
                style={{ backgroundColor: primaryColor }}
              />
            ))}
          </div>
        </div>

        {/* Content - Perfectly Centered */}
        <div className="flex-grow flex flex-col justify-center items-center text-center px-4">
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 leading-tight max-w-full"
            style={{ color: primaryColor }}
          >
            {heading?.trim() || "No content"}
          </h2>
          {details && (
            <p 
              className="text-lg md:text-xl leading-relaxed max-w-4xl"
              style={{ color: textColor }}
            >
              {details.trim()}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {slideNumber} / {totalSlides}
          </div>
          <div 
            className="h-1 w-16 rounded-full" 
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
    </div>
  );
} 