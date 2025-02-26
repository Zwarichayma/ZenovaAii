import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Prepare the request body for your Strapi-based Zenova chatbot
  const requestBody = {
    pipeline: {
      object_type: 0,
      object_id: "67b840b4b3c1594e1168d227",
    },
    messages: messages,
  };

  const result = await fetch('https://api.vectorshift.ai/api/chatbots/fetch', {
    method: 'POST',
    headers: {
      'Api-Key':'sk_76HXup1F4O5JdZp1mWUGhWvQ4gtwL0X811c0oFpmgKafhEAZ',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await result.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}