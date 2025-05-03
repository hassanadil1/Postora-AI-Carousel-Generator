import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize Groq client with correct configuration
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.warn("GROQ_API_KEY is not set in environment variables");
}

const groq = new Groq({
  apiKey: apiKey || "", // Prevent undefined error
});

// Fallback function to generate mock bullet points
function generateMockBulletPoints(content: string): string[] {
  // Create 10 simple bullet points based on the content length
  // This is just a fallback when the API is not available
  console.log("Using mock bullet points generator");
  
  const contentPreview = content.substring(0, 100).replace(/\n/g, ' ');
  return [
    `Content Overview: This bullet point summarizes the provided content which starts with "${contentPreview}..."`,
    "Key Point 1: This is the first key point extracted from the content.",
    "Key Point 2: This is the second key point with additional details.",
    "Important Finding: This bullet highlights an important aspect from the content.",
    "Critical Analysis: This provides analytical insights about the main topic.",
    "Practical Application: This discusses how the content can be applied practically.",
    "Statistical Relevance: This mentions numerical or statistical information from the content.",
    "Future Implications: This explores potential future developments related to the content.",
    "Comparison Point: This compares different aspects mentioned in the content.",
    "Conclusion: This summarizes the main takeaways from the entire content."
  ];
}

export async function POST(request: Request) {
  try {
    // Get user but don't block if not authenticated for development
    const user = await currentUser();
    const isDev = process.env.NODE_ENV === 'development';

    if (!user?.id && !isDev) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get content from request body
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // If API key is missing and in development, use mock data
    if (!apiKey && isDev) {
      const mockBulletPoints = generateMockBulletPoints(body.content);
      console.log("Using mock bullet points due to missing API key");
      return NextResponse.json({ bulletPoints: mockBulletPoints });
    }

    try {
      console.log("Calling Groq API with content length:", body.content.length);
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Analyze this text and generate exactly 10 key bullet points. 
            Use the following format for each bullet point: 
            [Bullet point HEADING]: [Bullet point details].
            The bullet point heading should be a single sentence that captures the main idea of the bullet point.
            The bullet point details should be a single sentence that provides more information about the bullet point.
            The bullet point heading and details should be separated by a colon.
            The bullet points should be separated by a new line.
            Your output should contain nothing but bullet points.\n\n${body.content}`
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 1024
      });

      const response = completion.choices[0]?.message?.content || "";
      console.log("Groq API response:", response);
      
      // Format the bullet points - make sure to return as an array
      const bulletPoints = response
        .split('\n')
        .filter((line: string) => line.trim())
        .map((point: string) => point.replace(/^[•\-\*]\s*/, '').trim())
        .filter((point: string) => point.length > 0);

      console.log("Formatted bullet points:", bulletPoints);
      
      return NextResponse.json({ bulletPoints });

    } catch (error: any) {
      console.error("Groq API error:", error);
      
      // Use mock data as fallback in development mode
      if (isDev) {
        console.log("Falling back to mock bullet points due to API error");
        const mockBulletPoints = generateMockBulletPoints(body.content);
        return NextResponse.json({ bulletPoints: mockBulletPoints });
      }
      
      return NextResponse.json(
        { 
          error: "Failed to generate bullet points",
          details: error.message || "Unknown error"
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Invalid request format", details: error.message },
      { status: 400 }
    );
  }
}
 