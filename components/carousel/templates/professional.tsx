"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProfessionalTemplateProps {
  bulletPoint: string;
  slideNumber: number;
  totalSlides: number;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function ProfessionalTemplate({
  bulletPoint = "",
  slideNumber,
  totalSlides,
  logo,
  primaryColor = "#0f172a",
  secondaryColor = "#64748b",
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
      className="w-full h-full flex flex-col justify-between p-10 bg-white"
      style={{ 
        '--primary-color': primaryColor,
        '--secondary-color': secondaryColor
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        {logo && (
          <div className="w-20 h-20 relative">
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

      {/* Content */}
      <div className="flex-grow flex flex-col justify-center my-8">
        <h2 
          className="text-3xl font-bold mb-6"
          style={{ color: primaryColor }}
        >
          {heading || "No content"}
        </h2>
        {details && (
          <p 
            className="text-xl"
            style={{ color: secondaryColor }}
          >
            {details}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span 
          className="text-sm"
          style={{ color: secondaryColor }}
        >
          Slide {slideNumber} of {totalSlides}
        </span>
        <div className="h-0.5 w-20 rounded-full" style={{ backgroundColor: primaryColor }} />
      </div>
    </div>
  );
} 