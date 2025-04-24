// File: /app/api/gemini/route.ts

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { Message } from "ai";
import { NextRequest } from "next/server";

export const runtime = "edge";

// 1. Create the provider
const googleProvider = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// 2. Create a model instance from the provider
const model = googleProvider("gemini-pro");

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Use the model instance
    const result = await streamText({
      model,
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: "An error occurred", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
