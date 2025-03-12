import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Google Generative AI with the provided API key
const genAI = "AIzaSyCSfbsP63GrmdnwHfbw8acxoeJq1haqSXQ"

export async function POST(req: Request) {
  try {
    const { message, history, conversation_id } = await req.json()

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    // Format history for Gemini
    const formattedHistory =
      history?.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })) || []

    try {
      // Start a chat
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
        },
      })

      // Send message and get response
      const result = await chat.sendMessage(message)
      const response = await result.response
      const text = response.text()

      return new Response(
        JSON.stringify({
          response: text,
          conversation_id: conversation_id || Date.now().toString(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } catch (modelError) {
      console.error("Gemini API Error:", modelError)
      return new Response(
        JSON.stringify({
          error: "AI model error",
          details: modelError.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Chat API Error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

