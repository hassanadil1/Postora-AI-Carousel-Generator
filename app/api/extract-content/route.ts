// app/api/extract-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Fetch the content from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL content' }, { status: 500 });
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract title
    let title = $('h1').first().text().trim();
    if (!title) {
      title = $('title').text().trim();
    }
    
    // Extract content - looking for the main article content
    let articleContent = '';
    
    // Try different common article selectors
    const selectors = [
      'article', 
      '.article', 
      '.post-content', 
      '.entry-content', 
      '.blog-post', 
      'main', 
      '#content',
      '.content'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Remove unnecessary elements that usually aren't part of the main content
        element.find('script, style, nav, footer, header, aside, .comments, .sidebar, .advertisement').remove();
        
        // Get the text content
        articleContent = element.text().trim();
        break;
      }
    }
    
    // If no content was found with the selectors, try to get content from the body
    if (!articleContent) {
      $('body').find('script, style, nav, footer, header, aside, .comments, .sidebar, .advertisement').remove();
      articleContent = $('body').text().trim();
    }
    
    // Clean up the content
    articleContent = articleContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n\n')
      .trim();
    
    // Combine title and content
    let content = title ? `${title}\n\n${articleContent}` : articleContent;
    
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 });
  }
}