// app/api/extract-content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Function to clean and structure the extracted content
function cleanAndStructureContent(rawContent: string, title: string = ''): string {
  let content = rawContent;
  
  // Only do light cleaning - remove dates and author info from the beginning
  content = content
    // Remove timestamps and dates (but only common patterns)
    .replace(/^.*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}.*$/gmi, '')
    .replace(/^\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*/gm, '')
    .replace(/^\s*\d{4}-\d{2}-\d{2}\s*/gm, '')
    
    // Remove author bylines (only at the beginning)
    .replace(/^\s*(?:By|Author|Written by|Posted by)\s+[A-Z][a-z]+\s*[A-Z]*[a-z]*\s*/gmi, '')
    
    // Remove excessive whitespace but preserve paragraph structure
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/^\s+/gm, '')
    .trim();

  // Combine title and content
  let finalContent = '';
  if (title) {
    finalContent += `# ${title}\n\n`;
  }
  
  finalContent += content;
  
  return finalContent;
}

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
    
    // Extract content - looking for the main article content with improved selectors
    let articleContent = '';
    
    // Enhanced selectors that are more likely to contain actual blog content
    const selectors = [
      'article .entry-content',
      'article .post-content', 
      '.entry-content',
      '.post-content',
      '.article-content',
      '.blog-content',
      '.content-area',
      'article',
      '.article', 
      '.post',
      '.blog-post',
      '.single-post',
      'main article',
      'main .content',
      '[role="main"]',
      'main', 
      '#main-content',
      '#content',
      '.content',
      '#post-content',
      '.post-body'
    ];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length > 0) {
        console.log(`Found content with selector: ${selector}`);
        
        // Remove unnecessary elements but keep the structure
        element.find('script, style, nav, footer, header, aside, .comments, .sidebar, .advertisement, .social-share, .author-bio, .related-posts, .tags, .categories, .share-buttons').remove();
        
        // Extract content while preserving structure (including bullet points)
        let extractedContent = '';
        
        // Process each child element to preserve structure
        element.children().each((index, child) => {
          const $child = $(child);
          const tagName = child.tagName?.toLowerCase();
          
          // Handle different content types
          if (tagName === 'p' || tagName === 'div') {
            const text = $child.text().trim();
            if (text.length > 10) {
              extractedContent += text + '\n\n';
            }
          } else if (tagName === 'ul' || tagName === 'ol') {
            // Extract list items as bullet points
            $child.find('li').each((i, li) => {
              const listText = $(li).text().trim();
              if (listText.length > 5) {
                extractedContent += `• ${listText}\n`;
              }
            });
            extractedContent += '\n';
          } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            const headingText = $child.text().trim();
            if (headingText.length > 3 && headingText.toLowerCase() !== title.toLowerCase()) {
              extractedContent += `\n## ${headingText}\n\n`;
            }
          } else if (tagName === 'blockquote') {
            const quoteText = $child.text().trim();
            if (quoteText.length > 10) {
              extractedContent += `> ${quoteText}\n\n`;
            }
          } else {
            // For other elements, just extract text
            const text = $child.text().trim();
            if (text.length > 10) {
              extractedContent += text + '\n\n';
            }
          }
        });
        
        if (extractedContent.trim().length > 100) {
          articleContent = extractedContent.trim();
          console.log(`Successfully extracted ${articleContent.length} characters`);
          break;
        }
      }
    }
    
    // Fallback: if no content found with structured extraction, try simpler approach
    if (!articleContent || articleContent.length < 100) {
      console.log('Trying fallback extraction method');
      
      // Try to find the largest text block
      const potentialContainers = $('div, article, section, main').filter((i, el) => {
        const text = $(el).text().trim();
        return text.length > 500 && !$(el).find('nav, footer, header, aside').length;
      });
      
             if (potentialContainers.length > 0) {
         let largestContainer = potentialContainers[0];
         let maxLength = $(largestContainer).text().length;
         
         potentialContainers.each((i, el) => {
           const currentLength = $(el).text().length;
           if (currentLength > maxLength) {
             maxLength = currentLength;
             largestContainer = el;
           }
         });
        
        $(largestContainer).find('script, style, nav, footer, header, aside, .comments, .sidebar, .advertisement').remove();
        articleContent = $(largestContainer).text().trim();
      }
    }
    
    // Final fallback
    if (!articleContent || articleContent.length < 50) {
      console.log('Using body text as final fallback');
      $('body').find('script, style, nav, footer, header, aside, .comments, .sidebar, .advertisement, .social-share, .author-bio, .related-posts').remove();
      articleContent = $('body').text().trim();
    }
    
    // Clean and structure the content
    const cleanedContent = cleanAndStructureContent(articleContent, title);
    
    console.log('Original content length:', articleContent.length);
    console.log('Cleaned content length:', cleanedContent.length);
    console.log('Content preview:', cleanedContent.substring(0, 200) + '...');
    
    return NextResponse.json({ content: cleanedContent });
  } catch (error) {
    console.error('Error processing URL:', error);
    return NextResponse.json({ error: 'Failed to process URL' }, { status: 500 });
  }
}