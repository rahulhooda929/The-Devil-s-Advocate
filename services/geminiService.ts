import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Message, AgentRole, Source, DebateScore } from "../types";

const API_KEY = process.env.API_KEY || '';

// We use the same instance but might create different chat sessions
const ai = new GoogleGenAI({ apiKey: API_KEY });

// System instruction for the "Debater" agent
const DEBATER_INSTRUCTION = `
You are "The Devil's Advocate". Your purpose is to challenge the user's worldview constructively using the Socratic method and evidence-based counter-arguments.

Roles & Behavior:
1.  **The Listener:** Acknowledge the user's point briefly but verify if it's opinion or fact.
2.  **The Researcher:** You have access to Google Search. You MUST use it to find real-time, contradictory evidence to the user's specific claims. Do not rely solely on training data.
3.  **The Debater:** Synthesize the research into a compelling counter-argument.
    -   Be respectful but relentless.
    -   Point out logical fallacies (ad hominem, straw man, confirmation bias).
    -   Use the retrieved evidence to support your counter-points.
    -   Ask a probing question at the end to force the user to defend their position deeper.

Tone: Intellectual, slightly provocative, rigorously logical, yet polite.
Format: Use Markdown.
`;

// System instruction for the "Judge" agent (Evaluator)
const JUDGE_INSTRUCTION = `
You are an impartial Debate Judge. Your job is to score the *User's* latest argument based on three criteria:
1. Logic (Coherence, absence of fallacies).
2. Evidence (Use of facts, data, or concrete examples).
3. Emotional Control (Civility, tone).

Return the result in JSON format only.
`;

let chatSession: Chat | null = null;

export const startDebateSession = (topic: string): void => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: DEBATER_INSTRUCTION,
      tools: [{ googleSearch: {} }], // Enable grounding
    },
  });
};

export const sendDebateMessage = async (text: string): Promise<{ text: string; sources: Source[] }> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message: text });
    
    // Extract text
    const responseText = result.text || "I have nothing to say.";

    // Extract grounding sources (if any)
    const sources: Source[] = [];
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Filter duplicates
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      text: responseText,
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Debate Agent Error:", error);
    return {
      text: "I apologize, but I am unable to formulate a counter-argument at this moment due to a connection issue. Let's pause and resume shortly.",
      sources: []
    };
  }
};

export const evaluateUserArgument = async (userText: string, context: string): Promise<DebateScore> => {
  try {
    const prompt = `
      Context of debate: ${context}
      User's latest argument: "${userText}"
      
      Evaluate the user's performance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: JUDGE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            logic: { type: Type.NUMBER, description: "Score 0-100 for logical consistency" },
            evidence: { type: Type.NUMBER, description: "Score 0-100 for factual backing" },
            emotionalControl: { type: Type.NUMBER, description: "Score 0-100 for tone/civility" },
            feedback: { type: Type.STRING, description: "One sentence constructive critique" }
          },
          required: ["logic", "evidence", "emotionalControl", "feedback"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No evaluation generated");

    return JSON.parse(jsonText) as DebateScore;

  } catch (error) {
    console.error("Judge Agent Error:", error);
    // Return neutral score on failure
    return {
      logic: 50,
      evidence: 50,
      emotionalControl: 50,
      feedback: "Evaluation unavailable."
    };
  }
};