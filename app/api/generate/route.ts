import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Log the request body for debugging
    const body = await request.json();
    console.log('Received content:', body);

    if (!body.content) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `Analyze this text and generate exactly ten key bullet points. 
            Use the following format for each bullet point: 
            [Bullet point HEADING]: [Bullet point details].
            The bullet point heading should be a single sentence that captures the main idea of the bullet point.
            The bullet point details should be a single sentence that provides more information about the bullet point.
            The bullet point heading and details should be separated by a colon.
            The bullet points should be separated by a new line.
            The bullet points should be in the same order as they appear in the text.
            Your output should contain nothing but bullet points.\n\n${body.content}`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || "";
      
      // Format the bullet points
      const bulletPoints = response
        .split('\n')
        .filter((line: string) => line.trim())
        .map((point: string, index: number) => ({
          priority: index + 1,
          point: point.replace(/^[•\-\*]\s*/, '').trim(),
          relevance: 1 - (index * 0.05)
        }))
        .slice(0, 10);

      return NextResponse.json({ bulletPoints });

    } catch (error) {
      console.error("Groq API error:", error);
      return NextResponse.json(
        { error: "Failed to generate bullet points" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}
 