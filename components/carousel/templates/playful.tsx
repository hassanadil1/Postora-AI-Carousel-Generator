"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PlayfulTemplateProps {
  bulletPoint: string;
  slideNumber: number;
  totalSlides: number;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function PlayfulTemplate({
  bulletPoint,
  slideNumber,
  totalSlides,
  logo,
  primaryColor = "#6d28d9",
  secondaryColor = "#a78bfa",
}: PlayfulTemplateProps) {
  // Extract heading and details
  const [heading, details] = bulletPoint.includes(':') 
    ? bulletPoint.split(':', 2)
    : [bulletPoint, ''];

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-10 rounded-2xl"
      style={{ 
        background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}30)`,
        borderColor: primaryColor,
        borderWidth: '4px'
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

      {/* Content */}
      <div className="flex-grow flex flex-col justify-center my-6 p-6 bg-white/80 rounded-xl backdrop-blur-sm">
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: primaryColor }}
        >
          {heading.trim()}
        </h2>
        {details && (
          <p 
            className="text-xl"
            style={{ color: '#4b5563' }}
          >
            {details.trim()}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center items-center">
        <span 
          className="text-sm font-medium px-4 py-1 rounded-full"
          style={{ backgroundColor: primaryColor, color: 'white' }}
        >
          {slideNumber} / {totalSlides}
        </span>
      </div>
    </div>
  );
} 