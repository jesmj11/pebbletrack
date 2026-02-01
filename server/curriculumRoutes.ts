import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage-replit";
import { insertCurriculumSchema, insertCurriculumLessonSchema } from "../shared/schema";

const router = Router();

// Curriculum creation schema
const createCurriculumSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  publisher: z.string().optional(),
  gradeLevel: z.string().optional(),
  description: z.string().optional(),
  lessons: z.array(z.object({
    lessonNumber: z.number(),
    title: z.string(),
    type: z.enum(["lesson", "quiz", "test", "review"]),
    description: z.string().optional(),
    estimatedMinutes: z.number().optional(),
  })).optional(),
});

// CSV import schema
const csvImportSchema = z.object({
  curriculumName: z.string().min(1),
  curriculumSubject: z.string().min(1),
  publisher: z.string().optional(),
  gradeLevel: z.string().optional(),
  lessons: z.array(z.object({
    lessonNumber: z.number().optional(),
    title: z.string(),
    type: z.enum(["lesson", "quiz", "test", "review"]).optional(),
    estimatedMinutes: z.number().optional(),
    description: z.string().optional(),
  })),
});

// Get all curricula for the current user
router.get("/curricula", async (req, res) => {
  try {
    const allCurricula = await storage.getCurricula();
    res.json(allCurricula);
  } catch (error) {
    console.error("Error fetching curricula:", error);
    res.status(500).json({ error: "Failed to fetch curricula" });
  }
});

// Get lessons for a specific curriculum
router.get("/curricula/:id/lessons", async (req, res) => {
  try {
    const curriculumId = parseInt(req.params.id);
    const lessons = await storage.getCurriculumLessons(curriculumId);
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching curriculum lessons:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
});

// Create new curriculum with lessons
router.post("/curricula", async (req, res) => {
  try {
    const validatedData = createCurriculumSchema.parse(req.body);
    
    // Create the curriculum
    const curriculumData = {
      parentId: "demo-parent", // Replace with actual user ID
      name: validatedData.name,
      subject: validatedData.subject,
      publisher: validatedData.publisher || null,
      gradeLevel: validatedData.gradeLevel || null,
      description: validatedData.description || null,
      totalLessons: validatedData.lessons?.length || 0,
    };

    const curriculum = await storage.createCurriculum(curriculumData);
    
    // Add lessons if provided
    if (validatedData.lessons && validatedData.lessons.length > 0) {
      const lessonPromises = validatedData.lessons.map(lesson => {
        const lessonData = {
          curriculumId: curriculum.id,
          lessonNumber: lesson.lessonNumber,
          title: lesson.title,
          type: lesson.type,
          description: lesson.description || null,
          estimatedMinutes: lesson.estimatedMinutes || 30,
        };
        return storage.createCurriculumLesson(lessonData);
      });
      
      await Promise.all(lessonPromises);
    }

    res.json(curriculum);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error creating curriculum:", error);
      res.status(500).json({ error: "Failed to create curriculum" });
    }
  }
});

// Import curriculum from CSV data
router.post("/curricula/import/csv", async (req, res) => {
  try {
    const validatedData = csvImportSchema.parse(req.body);
    
    // Create the curriculum
    const curriculumData = {
      parentId: "demo-parent",
      name: validatedData.curriculumName,
      subject: validatedData.curriculumSubject,
      publisher: validatedData.publisher || null,
      gradeLevel: validatedData.gradeLevel || null,
      description: `Imported from CSV - ${validatedData.lessons.length} lessons`,
      totalLessons: validatedData.lessons.length,
    };

    const curriculum = await storage.createCurriculum(curriculumData);
    
    // Process and add lessons
    const lessonPromises = validatedData.lessons.map((lesson, index) => {
      const lessonData = {
        curriculumId: curriculum.id,
        lessonNumber: lesson.lessonNumber || (index + 1),
        title: lesson.title,
        type: lesson.type || "lesson",
        description: lesson.description || null,
        estimatedMinutes: lesson.estimatedMinutes || 30,
      };
      return storage.createCurriculumLesson(lessonData);
    });
    
    await Promise.all(lessonPromises);

    res.json({
      curriculum,
      lessonsImported: validatedData.lessons.length,
      message: `Successfully imported "${curriculum.name}" with ${validatedData.lessons.length} lessons`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error importing CSV curriculum:", error);
      res.status(500).json({ error: "Failed to import curriculum" });
    }
  }
});

// Parse text content and suggest lesson structure
router.post("/curricula/parse", async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: "Content is required" });
    }
    
    const parsedLessons = smartParseContent(content);
    
    res.json({
      lessonsFound: parsedLessons.length,
      lessons: parsedLessons,
      suggestions: generateImportSuggestions(parsedLessons)
    });
  } catch (error) {
    console.error("Error parsing content:", error);
    res.status(500).json({ error: "Failed to parse content" });
  }
});

// Get curriculum templates
router.get("/templates", async (req, res) => {
  try {
    const templates = getCurriculumTemplates();
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Load specific template
router.get("/templates/:templateId", async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await loadCurriculumTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    
    res.json(template);
  } catch (error) {
    console.error("Error loading template:", error);
    res.status(500).json({ error: "Failed to load template" });
  }
});

// Helper function to smart parse content
function smartParseContent(content: string) {
  const lines = content.split('\n').filter(line => line.trim());
  const lessons = [];
  let lessonNumber = 1;
  
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    
    // Skip common headers/footers
    if (cleanLine.toLowerCase().includes('table of contents') || 
        cleanLine.toLowerCase().includes('chapter') ||
        cleanLine.length < 3) continue;
    
    // Extract lesson number if present
    const numberMatch = cleanLine.match(/^(?:Lesson\s*)?(\d+)[:.\-\s]*(.+)/i);
    let title = cleanLine;
    
    if (numberMatch) {
      lessonNumber = parseInt(numberMatch[1]);
      title = numberMatch[2].trim();
    }
    
    // Determine lesson type based on keywords
    let type = 'lesson';
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('quiz') || lowerTitle.includes('assessment')) {
      type = 'quiz';
    } else if (lowerTitle.includes('test') || lowerTitle.includes('exam') || lowerTitle.includes('final')) {
      type = 'test';
    } else if (lowerTitle.includes('review') || lowerTitle.includes('practice')) {
      type = 'review';
    }
    
    // Estimate time based on type and content
    let estimatedMinutes = 30;
    if (type === 'quiz') estimatedMinutes = 20;
    else if (type === 'test') estimatedMinutes = 45;
    else if (lowerTitle.includes('introduction') || lowerTitle.includes('overview')) estimatedMinutes = 25;
    else if (lowerTitle.includes('project') || lowerTitle.includes('lab')) estimatedMinutes = 60;
    
    lessons.push({
      lessonNumber: lessonNumber,
      title: title,
      type: type as "lesson" | "quiz" | "test" | "review",
      estimatedMinutes: estimatedMinutes,
      description: null
    });
    
    lessonNumber++;
  }
  
  return lessons;
}

// Generate suggestions for import
function generateImportSuggestions(lessons: any[]) {
  const suggestions = [];
  
  // Check for missing lesson numbers
  const hasNumbers = lessons.some(l => l.lessonNumber > 0);
  if (!hasNumbers) {
    suggestions.push("Consider adding lesson numbers for better organization");
  }
  
  // Check type distribution
  const typeCount = lessons.reduce((acc, lesson) => {
    acc[lesson.type] = (acc[lesson.type] || 0) + 1;
    return acc;
  }, {});
  
  if (!typeCount.quiz && lessons.length > 10) {
    suggestions.push("Consider adding quizzes for periodic assessment");
  }
  
  if (!typeCount.test && lessons.length > 20) {
    suggestions.push("Consider adding tests for major assessments");
  }
  
  // Check lesson length
  if (lessons.length > 100) {
    suggestions.push("Large curriculum detected - consider breaking into smaller units");
  }
  
  return suggestions;
}

// Get available curriculum templates
function getCurriculumTemplates() {
  return [
    {
      id: "saxon-math-76",
      name: "Saxon Math 7/6",
      subject: "Math",
      publisher: "Saxon Publishers",
      gradeLevel: "7th Grade",
      totalLessons: 120,
      description: "Saxon Math 7/6 complete lesson structure with investigations and tests"
    },
    {
      id: "teaching-textbooks-algebra",
      name: "Teaching Textbooks Algebra 1",
      subject: "Math",
      publisher: "Teaching Textbooks",
      gradeLevel: "High School",
      totalLessons: 122,
      description: "Teaching Textbooks Algebra 1 with CD-ROM lessons and assessments"
    },
    {
      id: "apologia-general-science",
      name: "Apologia General Science",
      subject: "Science",
      publisher: "Apologia",
      gradeLevel: "Middle School",
      totalLessons: 16,
      description: "Apologia General Science modules with experiments and reviews"
    },
    {
      id: "trail-guide-geography",
      name: "Trail Guide to Geography",
      subject: "Geography",
      publisher: "Geography Matters",
      gradeLevel: "Elementary",
      totalLessons: 36,
      description: "Trail Guide to Geography weekly lessons covering world geography"
    }
  ];
}

// Load specific curriculum template
async function loadCurriculumTemplate(templateId: string) {
  const templates = {
    "saxon-math-76": {
      name: "Saxon Math 7/6",
      subject: "Math",
      publisher: "Saxon Publishers",
      gradeLevel: "7th Grade",
      description: "Complete Saxon Math 7/6 curriculum",
      lessons: generateSaxonMath76Lessons()
    },
    "teaching-textbooks-algebra": {
      name: "Teaching Textbooks Algebra 1",
      subject: "Math",
      publisher: "Teaching Textbooks",
      gradeLevel: "High School",
      description: "Teaching Textbooks Algebra 1 complete curriculum",
      lessons: generateTeachingTextbooksAlgebra()
    }
    // Add more templates as needed
  };
  
  return templates[templateId] || null;
}

// Generate Saxon Math 7/6 lesson structure
function generateSaxonMath76Lessons() {
  const lessons = [];
  
  for (let i = 1; i <= 120; i++) {
    let type = 'lesson';
    let title = `Lesson ${i}`;
    let estimatedMinutes = 30;
    
    // Add investigations every 10 lessons
    if (i % 10 === 0) {
      type = 'review';
      title = `Investigation ${Math.floor(i / 10)}`;
      estimatedMinutes = 45;
    }
    
    // Add tests every 20 lessons
    if (i % 20 === 0) {
      type = 'test';
      title = `Test ${Math.floor(i / 20)}`;
      estimatedMinutes = 50;
    }
    
    lessons.push({
      lessonNumber: i,
      title: title,
      type: type,
      estimatedMinutes: estimatedMinutes,
      description: `Saxon Math 7/6 - ${title}`
    });
  }
  
  return lessons;
}

// Generate Teaching Textbooks Algebra lesson structure
function generateTeachingTextbooksAlgebra() {
  const lessons = [];
  const topics = [
    "Variables and Expressions", "Order of Operations", "Adding Real Numbers",
    "Subtracting Real Numbers", "Multiplying Real Numbers", "Dividing Real Numbers",
    // ... more topics would be added
  ];
  
  for (let i = 1; i <= 122; i++) {
    let type = 'lesson';
    let title = `Lesson ${i}`;
    let estimatedMinutes = 35;
    
    // Add quizzes every 15 lessons
    if (i % 15 === 0) {
      type = 'quiz';
      title = `Quiz ${Math.floor(i / 15)}`;
      estimatedMinutes = 25;
    }
    
    // Add tests every 30 lessons
    if (i % 30 === 0) {
      type = 'test';
      title = `Test ${Math.floor(i / 30)}`;
      estimatedMinutes = 45;
    }
    
    lessons.push({
      lessonNumber: i,
      title: title,
      type: type,
      estimatedMinutes: estimatedMinutes,
      description: `Teaching Textbooks Algebra 1 - ${title}`
    });
  }
  
  return lessons;
}

export default router;