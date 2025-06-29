/**
 * Canvas utilities for high-quality carousel generation
 * This replaces HTML2Canvas with programmatic Canvas drawing
 */

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  outputFormat?: 'linkedin' | 'twitter' | 'instagram';
}

export interface TextConfig {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: 'normal' | 'bold' | 'lighter';
  textAlign?: 'left' | 'center' | 'right';
  maxWidth?: number;
  lineHeight?: number;
}

export interface ShapeConfig {
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface GradientConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colorStops: Array<{ offset: number; color: string }>;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: CanvasConfig;

  constructor(config: CanvasConfig) {
    this.config = config;
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
    
    // Enable high-quality rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set background
    this.clear();
  }

  clear(): void {
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  drawText(config: TextConfig): void {
    const {
      text,
      x,
      y,
      fontSize,
      fontFamily,
      color,
      fontWeight = 'normal',
      textAlign = 'left',
      maxWidth,
      lineHeight = fontSize * 1.2
    } = config;

    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = textAlign as CanvasTextAlign;
    this.ctx.textBaseline = 'top';

    if (maxWidth) {
      // Handle text wrapping
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = this.ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw each line
      lines.forEach((line, index) => {
        this.ctx.fillText(line, x, y + (index * lineHeight));
      });
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  drawShape(config: ShapeConfig): void {
    const { type, x, y, width, height, radius, color, strokeColor, strokeWidth } = config;

    this.ctx.fillStyle = color;
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth || 1;
    }

    switch (type) {
      case 'rectangle':
        if (width && height) {
          this.ctx.fillRect(x, y, width, height);
          if (strokeColor) {
            this.ctx.strokeRect(x, y, width, height);
          }
        }
        break;
      
      case 'circle':
        if (radius) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
          this.ctx.fill();
          if (strokeColor) {
            this.ctx.stroke();
          }
        }
        break;
      
      case 'line':
        if (width !== undefined) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x + width, y);
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = height || 1;
          this.ctx.stroke();
        }
        break;
    }
  }

  drawGradient(config: GradientConfig, shape: ShapeConfig): void {
    const gradient = this.ctx.createLinearGradient(config.x1, config.y1, config.x2, config.y2);
    
    config.colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color);
    });

    this.ctx.fillStyle = gradient;
    
    // Apply gradient to shape
    if (shape.type === 'rectangle' && shape.width && shape.height) {
      this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
    }
  }

  async drawImage(src: string, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.ctx.drawImage(img, x, y, width, height);
        resolve();
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }

  drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, fillColor: string): void {
    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  addShadow(color: string, blur: number, offsetX: number = 0, offsetY: number = 0): void {
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = blur;
    this.ctx.shadowOffsetX = offsetX;
    this.ctx.shadowOffsetY = offsetY;
  }

  removeShadow(): void {
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  toDataURL(format: string = 'image/png', quality: number = 1.0): string {
    return this.canvas.toDataURL(format, quality);
  }

  toBlob(callback: (blob: Blob | null) => void, format: string = 'image/png', quality: number = 1.0): void {
    this.canvas.toBlob(callback, format, quality);
  }

  destroy(): void {
    // Clean up canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Utility functions for common operations
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getCanvasConfig(outputFormat: 'linkedin' | 'twitter' | 'instagram'): CanvasConfig {
  switch (outputFormat) {
    case 'twitter':
      return { width: 1600, height: 900, backgroundColor: '#ffffff', outputFormat };
    case 'instagram':
    case 'linkedin':
    default:
      return { width: 1080, height: 1080, backgroundColor: '#ffffff', outputFormat };
  }
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function getFontSize(text: string, maxWidth: number, maxHeight: number, ctx: CanvasRenderingContext2D, fontFamily: string): number {
  let fontSize = 100;
  
  while (fontSize > 12) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    
    if (metrics.width <= maxWidth && fontSize <= maxHeight) {
      break;
    }
    fontSize -= 2;
  }
  
  return fontSize;
} 