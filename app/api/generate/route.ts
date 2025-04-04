import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize Groq client with correct configuration
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
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
 