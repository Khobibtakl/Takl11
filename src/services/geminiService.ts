import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

export async function chatWithDocumentStream(
  documentText: string,
  history: ChatMessage[],
  newMessage: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const chatConfig = {
    systemInstruction: `You are an advanced document analysis assistant. 
Your task is to answer user queries based on the provided document text.
You can analyze, summarize, translate, and extract specific data when asked.
Always respond helpfully to the user in their own language.

DOCUMENT CONTENT:
----------------
${documentText}
----------------`,
    temperature: 0.7,
  };

  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: newMessage }] },
  ];

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3.5-flash',
    contents: contents as any,
    config: chatConfig,
  });

  let fullResponse = '';
  for await (const chunk of responseStream) {
    if (chunk.text) {
      fullResponse += chunk.text;
      onChunk(fullResponse);
    }
  }

  return fullResponse;
}

export async function extractTextFromImageStream(
  base64Image: string,
  mimeType: string,
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      temperature: 0.2, // Low temp for more accurate OCR
    },
  });

  let fullResponse = '';
  for await (const chunk of responseStream) {
    if (chunk.text) {
      fullResponse += chunk.text;
      onChunk(fullResponse);
    }
  }

  return fullResponse;
}

export async function generateOrEditImage(
  prompt: string,
  base64Image?: string,
  mimeType?: string
): Promise<{imageUrl: string; text?: string}> {
  const parts: any[] = [];
  if (base64Image && mimeType) {
     parts.push({
        inlineData: { data: base64Image, mimeType: mimeType }
     });
  }
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
       parts: parts
    },
    config: {
      imageConfig: {
         aspectRatio: "1:1"
      }
    }
  });

  let imageUrl = '';
  let text = '';
  for (const part of response.candidates?.[0]?.content?.parts || []) {
     if (part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
     } else if (part.text) {
        text += part.text;
     }
  }
  
  if (!imageUrl) {
     throw new Error("هیڅ انځور ونه موندل شو. مهرباني وکړئ بیا هڅه وکړئ."); // No image found.
  }
  return { imageUrl, text };
}

export async function chatWithImageStream(
  base64Image: string,
  mimeType: string,
  history: ChatMessage[], // Full history including the newest user message
  extractedText: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const contents: any[] = [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType,
          },
        },
        { text: `[System Context: The user has uploaded an image. Here is the extracted text for reference: \n${extractedText || 'No text found in image.'}\n\nPlease help the user with any queries about this image.]` },
      ]
    },
  ];

  for (const msg of history) {
     contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
     });
  }

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3.5-flash',
    contents: contents,
    config: {
      systemInstruction: 'You are an advanced AI vision assistant. You help users analyze the image they provided. Be helpful, accurate, and respond in the user\'s language.',
      temperature: 0.7,
    },
  });

  let fullResponse = '';
  for await (const chunk of responseStream) {
    if (chunk.text) {
      fullResponse += chunk.text;
      onChunk(fullResponse);
    }
  }

  return fullResponse;
}

