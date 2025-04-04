"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MinimalistTemplateProps {
  bulletPoint: string;
  slideNumber: number;
  totalSlides: number;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function MinimalistTemplate({
  bulletPoint,
  slideNumber,
  totalSlides,
  logo,
  primaryColor = "#171717",
  secondaryColor = "#737373",
}: MinimalistTemplateProps) {
  // Extract heading and details
  const [heading, details] = bulletPoint.includes(':') 
    ? bulletPoint.split(':', 2)
    : [bulletPoint, ''];

  return (
    <div 
      className="w-full h-full flex flex-col justify-between p-12 bg-white"
    >
      {/* Header */}
      <div className="flex justify-end">
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
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col justify-center">
        <h2 
          className="text-4xl font-light mb-8 leading-tight"
          style={{ color: primaryColor }}
        >
          {heading.trim()}
        </h2>
        {details && (
          <p 
            className="text-xl font-light"
            style={{ color: secondaryColor }}
          >
            {details.trim()}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span 
          className="text-xs"
          style={{ color: secondaryColor }}
        >
          {slideNumber}/{totalSlides}
        </span>
        <div 
          className="h-px w-12"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </div>
  );
} 