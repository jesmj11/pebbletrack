import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractLessonsFromImage(base64Image: string, curriculumName: string): Promise<any[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing curriculum lesson indexes. Extract lesson information from the provided image and return a JSON array of lessons. Each lesson should have:
          - lessonNumber: integer
          - title: string (lesson title)
          - type: "lesson" | "quiz" | "test" | "review" | "exam"
          - description: string (brief description if available)
          - estimatedMinutes: integer (default 30 for lessons, 25 for quizzes, 45 for tests)
          
          Look for patterns like:
          - Lesson numbers (1, 2, 3, etc.)
          - Chapter titles or lesson names
          - Quiz/Test indicators
          - Any section breaks or groupings
          
          Return only valid JSON array format. Be thorough and capture all visible lessons.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all lessons from this ${curriculumName} lesson index. Return as JSON array with the structure specified.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.lessons || [];
  } catch (error) {
    console.error("Error extracting lessons from image:", error);
    throw new Error("Failed to extract lessons from image");
  }
}

export async function extractLessonsFromText(textContent: string, curriculumName: string): Promise<any[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at analyzing curriculum lesson indexes. Extract lesson information from the provided text and return a JSON object with a "lessons" array. Each lesson should have:
          - lessonNumber: integer
          - title: string (lesson title)
          - type: "lesson" | "quiz" | "test" | "review" | "exam"
          - description: string (brief description if available)
          - estimatedMinutes: integer (default 30 for lessons, 25 for quizzes, 45 for tests)
          
          Look for patterns like:
          - Lesson numbers (1, 2, 3, etc.)
          - Chapter titles or lesson names
          - Quiz/Test indicators
          - Any section breaks or groupings
          
          Return only valid JSON with a "lessons" array. Be thorough and capture all lessons mentioned.`
        },
        {
          role: "user",
          content: `Extract all lessons from this ${curriculumName} lesson index text:

${textContent}

Return as JSON object with "lessons" array containing the lesson structure specified.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.lessons || [];
  } catch (error) {
    console.error("Error extracting lessons from text:", error);
    throw new Error("Failed to extract lessons from text");
  }
}

export async function enhanceCurriculumDescription(curriculumName: string, publisher: string, gradeLevel: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational curriculum expert. Provide a brief, informative description of the given curriculum."
        },
        {
          role: "user",
          content: `Write a brief description (2-3 sentences) for the curriculum "${curriculumName}" by ${publisher} for ${gradeLevel}. Focus on key learning objectives and teaching approach.`
        },
      ],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error enhancing curriculum description:", error);
    return "";
  }
}