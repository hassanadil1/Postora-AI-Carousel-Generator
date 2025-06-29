/**
 * Canvas-based templates for high-quality carousel generation
 * These replace the HTML-based templates with programmatic Canvas drawing
 */

import { CanvasRenderer, getCanvasConfig, hexToRgba } from './canvas-utils';

export interface TemplateProps {
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
  outputFormat?: 'linkedin' | 'twitter' | 'instagram';
  textAlign?: 'left' | 'center' | 'right';
}

export abstract class BaseCanvasTemplate {
  protected renderer: CanvasRenderer;
  protected props: TemplateProps;
  protected width: number;
  protected height: number;
  
  constructor(props: TemplateProps) {
    this.props = props;
    const config = getCanvasConfig(props.outputFormat || 'linkedin');
    config.backgroundColor = props.backgroundColor;
    this.renderer = new CanvasRenderer(config);
    this.width = config.width;
    this.height = config.height;
  }

  abstract render(): Promise<HTMLCanvasElement>;

  protected parseContent(): { heading: string; details: string } {
    const { bulletPoint } = this.props;
    if (!bulletPoint || typeof bulletPoint !== 'string') {
      return { heading: 'No content', details: '' };
    }

    if (bulletPoint.includes(':')) {
      const parts = bulletPoint.split(':', 2);
      return {
        heading: parts[0]?.trim() || '',
        details: parts[1]?.trim() || ''
      };
    }

    return { heading: bulletPoint.trim(), details: '' };
  }

  protected async drawLogo(): Promise<void> {
    if (!this.props.logo) return;

    try {
      const logoSize = 48;
      const margin = 32;
      await this.renderer.drawImage(
        this.props.logo,
        margin,
        margin,
        logoSize,
        logoSize
      );
    } catch (error) {
      console.warn('Failed to draw logo:', error);
    }
  }

  protected async drawBackgroundImage(): Promise<void> {
    if (!this.props.backgroundImage) return;

    try {
      // Create a temporary canvas for opacity effect
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          tempCtx.drawImage(img, 0, 0, this.width, this.height);
          resolve();
        };
        img.onerror = reject;
        img.src = this.props.backgroundImage!;
      });

      // Apply opacity
      tempCtx.globalAlpha = this.props.backgroundImageOpacity || 0.3;
      
      // Draw the background image with opacity
      const canvas = this.renderer.getCanvas();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = this.props.backgroundImageOpacity || 0.3;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.globalAlpha = 1; // Reset
      }
    } catch (error) {
      console.warn('Failed to draw background image:', error);
    }
  }

  protected drawSlideCounter(): void {
    const margin = 32;
    const fontSize = 14;
    const text = `${this.props.slideNumber} / ${this.props.totalSlides}`;
    
    this.renderer.drawText({
      text,
      x: margin,
      y: this.height - margin - fontSize,
      fontSize,
      fontFamily: this.props.fontFamily || 'Arial',
      color: '#6b7280',
      textAlign: 'left'
    });
  }

  getCanvas(): HTMLCanvasElement {
    return this.renderer.getCanvas();
  }

  destroy(): void {
    this.renderer.destroy();
  }
}

export class ProfessionalCanvasTemplate extends BaseCanvasTemplate {
  async render(): Promise<HTMLCanvasElement> {
    // Draw background image first if exists
    await this.drawBackgroundImage();
    
    // Draw logo
    await this.drawLogo();

    // Draw header line
    this.drawHeaderLine();

    // Draw main content
    this.drawContent();

    // Draw footer elements
    this.drawFooter();

    return this.getCanvas();
  }

  private drawHeaderLine(): void {
    const margin = 32;
    const lineHeight = 4;
    const lineY = margin + 24;
    const startX = this.props.logo ? margin + 48 + 16 : margin;
    const endX = this.width - margin;

    this.renderer.drawShape({
      type: 'rectangle',
      x: startX,
      y: lineY,
      width: endX - startX,
      height: lineHeight,
      color: this.props.primaryColor
    });
  }

  private drawContent(): void {
    const { heading, details } = this.parseContent();
    const textAlign = this.props.textAlign || 'center';
    const margin = 40;
    const maxWidth = this.width - (margin * 2);
    
    // Calculate X position based on alignment
    let x: number;
    switch (textAlign) {
      case 'left':
        x = margin;
        break;
      case 'right':
        x = this.width - margin;
        break;
      case 'center':
      default:
        x = this.width / 2;
        break;
    }
    
    const centerY = this.height / 2;

    // Draw heading
    const headingFontSize = this.calculateHeadingFontSize(heading);
    this.renderer.drawText({
      text: heading,
      x,
      y: centerY - (details ? 40 : 0),
      fontSize: headingFontSize,
      fontFamily: this.props.fontFamily || 'Arial',
      color: this.props.primaryColor,
      fontWeight: 'bold',
      textAlign,
      maxWidth
    });

    // Draw details if available
    if (details) {
      const detailsFontSize = Math.min(headingFontSize * 0.7, 40); // Increased from 32 to 40
      this.renderer.drawText({
        text: details,
        x,
        y: centerY + 20,
        fontSize: detailsFontSize,
        fontFamily: this.props.fontFamily || 'Arial',
        color: this.props.textColor || '#000000',
        textAlign,
        maxWidth
      });
    }
  }

  private drawFooter(): void {
    const margin = 32;
    const lineWidth = 64;
    const lineHeight = 2;
    
    // Draw slide counter
    this.drawSlideCounter();

    // Draw footer line
    this.renderer.drawShape({
      type: 'rectangle',
      x: this.width - margin - lineWidth,
      y: this.height - margin - 8,
      width: lineWidth,
      height: lineHeight,
      color: this.props.primaryColor
    });
  }

  private calculateHeadingFontSize(text: string): number {
    const maxWidth = this.width - 80;
    const baseSize = this.width > 1200 ? 80 : 60; // Increased from 64:48 to 80:60
    
    // Create temporary canvas to measure text
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return baseSize;

    let fontSize = baseSize;
    while (fontSize > 36) { // Increased minimum from 28 to 36
      ctx.font = `bold ${fontSize}px ${this.props.fontFamily || 'Arial'}`;
      const metrics = ctx.measureText(text);
      
      if (metrics.width <= maxWidth) {
        break;
      }
      fontSize -= 2;
    }

    return fontSize;
  }
}

export class MinimalistCanvasTemplate extends BaseCanvasTemplate {
  async render(): Promise<HTMLCanvasElement> {
    // Draw background image first if exists
    await this.drawBackgroundImage();
    
    // Draw minimal header
    await this.drawMinimalHeader();

    // Draw main content (perfectly centered)
    this.drawContent();

    // Draw minimal footer
    this.drawMinimalFooter();

    return this.getCanvas();
  }

  private async drawMinimalHeader(): Promise<void> {
    const margin = 32;
    
    // Draw logo if available
    if (this.props.logo) {
      const logoSize = 40;
      await this.renderer.drawImage(
        this.props.logo,
        margin,
        margin,
        logoSize,
        logoSize
      );
    }

    // Draw minimal line
    const lineWidth = 48;
    const lineHeight = 2;
    this.renderer.drawShape({
      type: 'rectangle',
      x: this.width - margin - lineWidth,
      y: margin + 20,
      width: lineWidth,
      height: lineHeight,
      color: this.props.primaryColor
    });
  }

  private drawContent(): void {
    const { heading, details } = this.parseContent();
    const textAlign = this.props.textAlign || 'center';
    const margin = 60;
    const maxWidth = this.width - (margin * 2);
    
    // Calculate X position based on alignment
    let x: number;
    switch (textAlign) {
      case 'left':
        x = margin;
        break;
      case 'right':
        x = this.width - margin;
        break;
      case 'center':
      default:
        x = this.width / 2;
        break;
    }
    
    const centerY = this.height / 2;

    // Draw heading with minimal styling
    const headingFontSize = this.calculateFontSize(heading, maxWidth);
    this.renderer.drawText({
      text: heading,
      x,
      y: centerY - (details ? 30 : 0),
      fontSize: headingFontSize,
      fontFamily: this.props.fontFamily || 'Arial',
      color: this.props.primaryColor,
      fontWeight: 'normal', // Lighter weight for minimalist
      textAlign,
      maxWidth
    });

    // Draw details if available
    if (details) {
      const detailsFontSize = Math.min(headingFontSize * 0.8, 38); // Increased from 30 to 38
      this.renderer.drawText({
        text: details,
        x,
        y: centerY + 15,
        fontSize: detailsFontSize,
        fontFamily: this.props.fontFamily || 'Arial',
        color: this.props.textColor || '#000000',
        fontWeight: 'normal',
        textAlign,
        maxWidth
      });
    }
  }

  private drawMinimalFooter(): void {
    const margin = 32;
    
    // Draw slide counter
    this.drawSlideCounter();

    // Draw minimal footer line
    const lineWidth = 32;
    const lineHeight = 2;
    this.renderer.drawShape({
      type: 'rectangle',
      x: this.width - margin - lineWidth,
      y: this.height - margin - 8,
      width: lineWidth,
      height: lineHeight,
      color: this.props.primaryColor
    });
  }

  private calculateFontSize(text: string, maxWidth: number): number {
    const baseSize = this.width > 1200 ? 72 : 52; // Increased from 58:42 to 72:52
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return baseSize;

    let fontSize = baseSize;
    while (fontSize > 34) { // Increased minimum from 26 to 34
      ctx.font = `${fontSize}px ${this.props.fontFamily || 'Arial'}`;
      const metrics = ctx.measureText(text);
      
      if (metrics.width <= maxWidth) {
        break;
      }
      fontSize -= 2;
    }

    return fontSize;
  }
}

export class PlayfulCanvasTemplate extends BaseCanvasTemplate {
  async render(): Promise<HTMLCanvasElement> {
    // Draw background with border
    this.drawPlayfulBackground();
    
    // Draw background image if exists
    await this.drawBackgroundImage();
    
    // Draw logo and dots
    await this.drawPlayfulHeader();

    // Draw content with playful styling
    this.drawContent();

    // Draw playful footer
    this.drawPlayfulFooter();

    return this.getCanvas();
  }

  private drawPlayfulBackground(): void {
    const margin = 16;
    const borderRadius = 24;
    const borderWidth = 3;

    // Draw rounded background with border
    this.renderer.drawRoundedRect(
      margin,
      margin,
      this.width - (margin * 2),
      this.height - (margin * 2),
      borderRadius,
      this.props.backgroundColor
    );

    // Draw border
    const canvas = this.renderer.getCanvas();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = this.props.primaryColor;
      ctx.lineWidth = borderWidth;
      ctx.beginPath();
      ctx.roundRect(margin, margin, this.width - (margin * 2), this.height - (margin * 2), borderRadius);
      ctx.stroke();
    }
  }

  private async drawPlayfulHeader(): Promise<void> {
    const margin = 48;
    
    // Draw logo
    if (this.props.logo) {
      const logoSize = 48;
      await this.renderer.drawImage(
        this.props.logo,
        margin,
        margin,
        logoSize,
        logoSize
      );
    }

    // Draw slide indicator dots
    this.drawSlideDots();
  }

  private drawSlideDots(): void {
    const margin = 48;
    const dotSize = 12;
    const dotSpacing = 8;
    const totalWidth = (this.props.totalSlides * dotSize) + ((this.props.totalSlides - 1) * dotSpacing);
    const startX = this.width - margin - totalWidth;
    const y = margin + (dotSize / 2);

    for (let i = 0; i < this.props.totalSlides; i++) {
      const x = startX + (i * (dotSize + dotSpacing)) + (dotSize / 2);
      const isActive = i === this.props.slideNumber - 1;
      const alpha = isActive ? 1 : 0.4;
      
      this.renderer.drawShape({
        type: 'circle',
        x,
        y,
        radius: dotSize / 2,
        color: hexToRgba(this.props.primaryColor, alpha)
      });
    }
  }

  private drawContent(): void {
    const { heading, details } = this.parseContent();
    const textAlign = this.props.textAlign || 'center';
    const margin = 60;
    const maxWidth = this.width - (margin * 2);
    
    // Calculate X position based on alignment
    let x: number;
    switch (textAlign) {
      case 'left':
        x = margin;
        break;
      case 'right':
        x = this.width - margin;
        break;
      case 'center':
      default:
        x = this.width / 2;
        break;
    }
    
    const centerY = this.height / 2;

    // Add subtle shadow for playful effect
    this.renderer.addShadow('rgba(0, 0, 0, 0.1)', 4, 2, 2);

    // Draw heading
    const headingFontSize = this.calculateFontSize(heading, maxWidth);
    this.renderer.drawText({
      text: heading,
      x,
      y: centerY - (details ? 35 : 0),
      fontSize: headingFontSize,
      fontFamily: this.props.fontFamily || 'Arial',
      color: this.props.primaryColor,
      fontWeight: 'bold',
      textAlign,
      maxWidth
    });

    // Remove shadow for details
    this.renderer.removeShadow();

    // Draw details if available
    if (details) {
      const detailsFontSize = Math.min(headingFontSize * 0.75, 40); // Increased from 32 to 40
      this.renderer.drawText({
        text: details,
        x,
        y: centerY + 25,
        fontSize: detailsFontSize,
        fontFamily: this.props.fontFamily || 'Arial',
        color: this.props.textColor || '#4b5563',
        textAlign,
        maxWidth
      });
    }
  }

  private drawPlayfulFooter(): void {
    const margin = 48;
    
    // Draw slide counter
    this.renderer.drawText({
      text: `${this.props.slideNumber} / ${this.props.totalSlides}`,
      x: margin,
      y: this.height - margin - 20,
      fontSize: 14,
      fontFamily: this.props.fontFamily || 'Arial',
      color: '#6b7280',
      textAlign: 'left'
    });

    // Draw playful footer line with rounded ends
    const lineWidth = 64;
    const lineHeight = 4;
    this.renderer.drawRoundedRect(
      this.width - margin - lineWidth,
      this.height - margin - 12,
      lineWidth,
      lineHeight,
      lineHeight / 2,
      this.props.primaryColor
    );
  }

  private calculateFontSize(text: string, maxWidth: number): number {
    const baseSize = this.width > 1200 ? 76 : 56; // Increased from 60:44 to 76:56
    
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return baseSize;

    let fontSize = baseSize;
    while (fontSize > 36) { // Increased minimum from 28 to 36
      ctx.font = `bold ${fontSize}px ${this.props.fontFamily || 'Arial'}`;
      const metrics = ctx.measureText(text);
      
      if (metrics.width <= maxWidth) {
        break;
      }
      fontSize -= 2;
    }

    return fontSize;
  }
}

// Template factory function
export function createCanvasTemplate(
  style: 'professional' | 'playful' | 'minimalist',
  props: TemplateProps
): BaseCanvasTemplate {
  switch (style) {
    case 'professional':
      return new ProfessionalCanvasTemplate(props);
    case 'playful':
      return new PlayfulCanvasTemplate(props);
    case 'minimalist':
      return new MinimalistCanvasTemplate(props);
    default:
      return new ProfessionalCanvasTemplate(props);
  }
}

// Utility function to generate and download a single slide
export async function generateSlideImage(
  style: 'professional' | 'playful' | 'minimalist',
  props: TemplateProps
): Promise<string> {
  const template = createCanvasTemplate(style, props);
  
  try {
    await template.render();
    const dataUrl = template.getCanvas().toDataURL('image/png', 1.0);
    template.destroy();
    return dataUrl;
  } catch (error) {
    template.destroy();
    throw error;
  }
} 