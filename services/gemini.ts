import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GenerateResumeInput {
  text?: string;
  fileData?: string; // base64 string
  mimeType?: string;
}

/**
 * Generates a structured resume JSON object based on user input (Text or PDF/Image).
 */
export const generateResume = async (input: GenerateResumeInput): Promise<ResumeData> => {
  // Define the strict schema for the resume data
  const resumeSchema = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING },
      jobTitle: { type: Type.STRING },
      contact: {
        type: Type.OBJECT,
        properties: {
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          linkedin: { type: Type.STRING, nullable: true },
          website: { type: Type.STRING, nullable: true },
        },
        required: ["email", "phone", "location"],
      },
      summary: { type: Type.STRING },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            role: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            description: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3-5 bullet points describing achievements and responsibilities."
            },
          },
          required: ["company", "role", "startDate", "endDate", "description"],
        },
      },
      education: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            institution: { type: Type.STRING },
            degree: { type: Type.STRING },
            year: { type: Type.STRING },
          },
          required: ["institution", "degree", "year"],
        },
      },
      skills: {
        type: Type.ARRAY,
        description: "Group skills by category (e.g., Languages, Tools, Frameworks)",
        items: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            items: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["category", "items"]
        },
      },
      projects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            technologies: { type: Type.STRING },
            description: { type: Type.ARRAY, items: { type: Type.STRING } },
            link: { type: Type.STRING, nullable: true }
          },
          required: ["name", "technologies", "description"]
        }
      },
      certifications: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                issuer: { type: Type.STRING },
                year: { type: Type.STRING }
            },
            required: ["name", "issuer", "year"]
        }
      },
      languages: {
          type: Type.ARRAY,
          items: {
              type: Type.OBJECT,
              properties: {
                  language: { type: Type.STRING },
                  proficiency: { type: Type.STRING }
              },
              required: ["language", "proficiency"]
          }
      },
      customSections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                 type: Type.OBJECT,
                 properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING, nullable: true },
                    date: { type: Type.STRING, nullable: true },
                    description: { type: Type.ARRAY, items: { type: Type.STRING } }
                 },
                 required: ["title", "description"]
              }
            }
          },
          required: ["id", "title", "items"]
        }
      }
    },
    required: ["fullName", "jobTitle", "contact", "summary", "experience", "education", "skills", "projects"],
  };

  const parts: any[] = [];

  // Add file if present
  if (input.fileData && input.mimeType) {
    // Strip prefix if present (e.g. "data:application/pdf;base64,")
    const cleanBase64 = input.fileData.split(',')[1] || input.fileData;
    parts.push({
      inlineData: {
        mimeType: input.mimeType,
        data: cleanBase64
      }
    });
  }

  // Add text prompt
  let promptText = `Create a professional, ATS-friendly resume data structure based on the provided information.
    Organize skills into logical categories (e.g., 'Languages & Databases', 'Tools', 'AI/ML').
    Extract or infer projects, certifications, and languages if available.
    If there is information about Volunteering, Awards, Publications, or other sections, add them to 'customSections' with an appropriate title.
    Use professional action verbs for descriptions.
    Ensure the JSON output strictly follows the schema.`;

  if (input.text) {
    promptText += `\n\nAdditional User Information:\n${input.text}`;
  }

  parts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: resumeSchema,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as ResumeData;
  }
  throw new Error("Failed to generate resume data. The model did not return a valid JSON response.");
};

/**
 * Improves a specific text snippet using Gemini.
 */
export const improveText = async (text: string, type: 'summary' | 'experience' | 'project'): Promise<string> => {
  const prompt = `Rewrite the following ${type} text for a professional resume.
  Make it concise, impact-oriented, and use strong action verbs.
  Do not add any introductory or concluding remarks, just return the improved text.
  
  Original Text:
  "${text}"`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: prompt }] },
  });

  return response.text?.trim() || text;
};

/**
 * Edits an image using Gemini 2.5 Flash Image.
 */
export const editImageWithGemini = async (base64Image: string, prompt: string): Promise<string> => {
  // clean base64 string if it has prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png', // Assuming png for simplicity, usually safe for uploads
            data: cleanBase64
          }
        },
        {
          text: prompt
        }
      ]
    }
  });

  // Iterate through parts to find the image
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image returned from Gemini.");
};