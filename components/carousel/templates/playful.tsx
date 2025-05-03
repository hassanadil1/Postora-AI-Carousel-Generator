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
  showGradientBackground?: boolean;
  gradientBackground?: string;
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
  showGradientBackground = false,
  gradientBackground,
}: PlayfulTemplateProps) {
  // Extract heading and details
  const [heading, details] = bulletPoint?.includes(':') 
    ? bulletPoint.split(':', 2)
    : [bulletPoint, ''];

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-10 rounded-2xl"
      style={{ 
        background: showGradientBackground && gradientBackground ? gradientBackground : backgroundColor,
        borderColor: primaryColor,
        borderWidth: showGradientBackground ? '0' : '4px',
        fontFamily: `var(--font-${fontFamily}, ${fontFamily}, sans-serif)`
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
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
        {!showGradientBackground && (
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
        )}
      </div>

      {/* Content - Better centered with improved text sizing */}
      <div className="flex-grow flex flex-col justify-center items-center my-6 text-center">
        <h2 
          className="text-4xl font-bold mb-6 leading-tight"
          style={{ color: primaryColor }}
        >
          {heading?.trim() || "No content"}
        </h2>
        {details && (
          <p 
            className="text-2xl leading-relaxed max-w-2xl"
            style={{ color: textColor }}
          >
            {details.trim()}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center">
        <div 
          className="h-1 w-20 rounded-full" 
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </div>
  );
} 