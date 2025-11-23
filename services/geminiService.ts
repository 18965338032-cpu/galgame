import { GoogleGenAI, Type } from "@google/genai";
import { StoryNode, GameGenre } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

const STORY_SYSTEM_INSTRUCTION = `
You are the writer and director of an interactive Visual Novel game designed in the style of an American Comic Book (Marvel/DC/Image style).
Your goal is to generate the next segment of the story based on the user's choice.

Style Guidelines:
1. Narrative: Punchy, dramatic, and descriptive. Use comic book tropes.
2. Dialogue: Character-driven, bold.
3. Visuals: Describe scenes that would look great in a comic panel (bold lines, dynamic angles).
4. Sound Effects: Include onomatopoeia where appropriate (POW, ZAP, SIGH).

You must output strictly valid JSON.
`;

export const startGame = async (genre: string, playerName: string): Promise<StoryNode> => {
  const ai = getAiClient();

  const prompt = `
    Start a new story in the '${genre}' genre.
    The protagonist is named '${playerName}'.
    Establish the setting, introduce a key character or conflict immediately.
    Provide 2-3 choices for the player to react.
  `;

  return generateStoryTurn(prompt);
};

export const nextTurn = async (previousContext: string, choiceText: string): Promise<StoryNode> => {
  const prompt = `
    Context so far: ${previousContext.slice(-1000)}
    
    The player chose: "${choiceText}".
    
    Advance the story. React to the choice.
    If the choice was romantic, advance the relationship.
    If aggressive, escalate conflict.
    
    Provide the next narrative segment, dialogue, and new choices.
  `;

  return generateStoryTurn(prompt);
};

const generateStoryTurn = async (prompt: string): Promise<StoryNode> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: STORY_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { type: Type.STRING, description: "The narration box text." },
            speakerName: { type: Type.STRING, description: "Name of the character speaking. Use 'Narrator' if no one is speaking." },
            dialogue: { type: Type.STRING, description: "What the character says." },
            visualDescription: { type: Type.STRING, description: "A detailed visual description of the current scene/panel for an image generator. Include artistic style keywords like 'American comic book style', 'bold lines', 'cel shaded'." },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  actionType: { type: Type.STRING, enum: ["neutral", "romantic", "aggressive", "funny"] }
                },
                required: ["id", "text", "actionType"]
              }
            },
            backgroundStyle: { type: Type.STRING, description: "Short keyword for background vibe." },
            soundEffectText: { type: Type.STRING, description: "Optional comic sound effect text like 'BOOM!' or 'CRACK!'" }
          },
          required: ["narrative", "speakerName", "dialogue", "visualDescription", "choices", "backgroundStyle"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as StoryNode;
    }
    throw new Error("No text returned from model");
  } catch (error) {
    console.error("Story generation error:", error);
    throw error;
  }
};

export const generateComicImage = async (description: string): Promise<string> => {
  const ai = getAiClient();
  
  // Enhance prompt for the specific model and style
  const enhancedPrompt = `
    Create a comic book panel illustration. 
    Style: Modern American superhero comic, sharp ink lines, vibrant coloring, Ben-Day dots texture, dynamic composition. 
    Scene: ${description}
    Do not include speech bubbles or text overlay.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: enhancedPrompt,
      config: {
        // No specific response schema for image models usually, but we need the base64
      }
    });

    // Iterate through parts to find the image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // Fallback logic if the model structure is slightly different or returns text (rare for image model if prompted correctly, but safety first)
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Image generation error:", error);
    // Return a placeholder if generation fails to keep the game playable
    return `https://picsum.photos/800/600?random=${Math.random()}`;
  }
};
