import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
    model: 'gemini-3-flash-preview',
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

