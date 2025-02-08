import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          prompt: `Analyze this text and generate exactly ten key bullet points. 
          Use the following format for each bullet point: 
          bullet point main idea: bullet point details.
          The bullet point main idea should be a single sentence that captures the main idea of the bullet point.
          The bullet point details should be a single sentence that provides more information about the bullet point.
          The bullet point main idea and details should be separated by a colon.
          The bullet points should be separated by a new line.
          The bullet points should be in the same order as they appear in the text.
          Your output should contain nothing but bullet points.\n\n${body.content}`,
          stream: false

        }),
      });

      const data = await response.json();
      
      // Extract only the actual bullet points after the thinking process
      let cleanedResponse = data.response;
      if (cleanedResponse.includes('</think>')) {
        cleanedResponse = cleanedResponse.split('</think>')[1].trim();
      }

      // Format the bullet points
      const bulletPoints = cleanedResponse
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
      console.error("Ollama error:", error);
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
