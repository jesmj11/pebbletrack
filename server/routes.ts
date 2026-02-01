import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs/promises';
import { analyzeCurriculumImage } from './anthropic.js';
import { storage } from "./storage-replit";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { 
  insertClassSchema, 
  insertStudentSchema,
  insertAssignmentSchema,
  insertTaskSchema,
  insertCurriculumSchema,
  insertCurriculumLessonSchema,
  insertStudentCurriculumSchema,
  insertLessonProgressSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Railway
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'production',
      env: process.env.NODE_ENV 
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.redirect('/static-dashboard');
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Add computed fullName for compatibility
      const userWithFullName = {
        ...user,
        fullName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || 'User'
      };
      
      res.json(userWithFullName);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student management routes
  app.get("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const students = await storage.getStudentsByParent(userId);
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.post("/api/students", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const studentData = insertStudentSchema.parse({
        ...req.body,
        parentId: userId
      });
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error: any) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: error.message || "Failed to create student" });
    }
  });

  app.patch("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const updateData = insertStudentSchema.partial().parse(req.body);
      const updatedStudent = await storage.updateStudent(studentId, updateData);
      
      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(updatedStudent);
    } catch (error: any) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: error.message || "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const deleted = await storage.deleteStudent(studentId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ message: "Student deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Class management routes
  app.get("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const classes = await storage.getClassesByTeacher(userId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.post("/api/classes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const classData = insertClassSchema.parse({
        ...req.body,
        teacherId: userId
      });
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error: any) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: error.message || "Failed to create class" });
    }
  });

  // Assignment management routes
  app.get("/api/assignments", isAuthenticated, async (req: any, res) => {
    try {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.post("/api/assignments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        createdBy: userId
      });
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      res.status(400).json({ message: error.message || "Failed to create assignment" });
    }
  });

  // Task management routes
  app.get("/api/tasks/student/:studentId", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const tasks = await storage.getTasksByStudent(studentId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: error.message || "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updateData = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(taskId, updateData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error: any) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: error.message || "Failed to update task" });
    }
  });

  // Curriculum management routes
  app.get("/api/curriculums", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const curriculums = await storage.getCurriculumsByParent(userId);
      res.json(curriculums);
    } catch (error) {
      console.error("Error fetching curriculums:", error);
      res.status(500).json({ message: "Failed to fetch curriculums" });
    }
  });

  app.post("/api/curriculums", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const curriculumData = insertCurriculumSchema.parse({
        ...req.body,
        parentId: userId
      });
      const curriculum = await storage.createCurriculum(curriculumData);
      res.status(201).json(curriculum);
    } catch (error: any) {
      console.error("Error creating curriculum:", error);
      res.status(400).json({ message: error.message || "Failed to create curriculum" });
    }
  });

  // Curriculum lessons
  app.get("/api/curriculums/:id/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const curriculumId = parseInt(req.params.id);
      const lessons = await storage.getCurriculumLessons(curriculumId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  app.post("/api/curriculums/:id/lessons", isAuthenticated, async (req: any, res) => {
    try {
      const curriculumId = parseInt(req.params.id);
      const lessonData = insertCurriculumLessonSchema.parse({
        ...req.body,
        curriculumId
      });
      const lesson = await storage.createCurriculumLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error: any) {
      console.error("Error creating lesson:", error);
      res.status(400).json({ message: error.message || "Failed to create lesson" });
    }
  });

  // AI curriculum extraction endpoints
  app.post("/api/curriculums/extract-lessons", isAuthenticated, async (req: any, res) => {
    try {
      // Mock AI extraction for now - in production this would call an AI service
      const { imageData, textContent, curriculumName, extractionType } = req.body;
      
      // Simulate lesson extraction
      const mockLessons = [
        {
          lessonNumber: 1,
          title: "Introduction to Fractions",
          type: "lesson",
          description: "Learn the basics of fractions",
          estimatedMinutes: 30
        },
        {
          lessonNumber: 2,
          title: "Adding Fractions",
          type: "lesson", 
          description: "Practice adding fractions with like denominators",
          estimatedMinutes: 45
        },
        {
          lessonNumber: 3,
          title: "Fraction Quiz 1",
          type: "quiz",
          description: "Test your understanding of basic fractions",
          estimatedMinutes: 20
        }
      ];

      res.json({
        lessons: mockLessons,
        count: mockLessons.length,
        extractionType
      });
    } catch (error: any) {
      console.error("Error extracting lessons:", error);
      res.status(500).json({ message: "Failed to extract lessons" });
    }
  });

  app.post("/api/curriculums/enhance-description", isAuthenticated, async (req: any, res) => {
    try {
      const { curriculumName, publisher, gradeLevel } = req.body;
      
      // Mock AI description enhancement
      const enhancedDescription = `${curriculumName} by ${publisher} is a comprehensive ${gradeLevel} curriculum designed to build strong foundational skills through engaging lessons and practical exercises. This curriculum emphasizes hands-on learning and provides clear progression paths for student success.`;

      res.json({
        description: enhancedDescription
      });
    } catch (error: any) {
      console.error("Error enhancing description:", error);
      res.status(500).json({ message: "Failed to enhance description" });
    }
  });

  // Forgot password page route
  app.get("/forgot-password", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reset Password - Homeschool Planner</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
          .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; margin-bottom: 30px; text-align: center; }
          .info { background: #e3f2fd; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; text-align: center; }
          .btn:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <div class="info">
            <p><strong>Using Replit Authentication</strong></p>
            <p>This application uses Replit's secure authentication system. To reset your password:</p>
            <ol>
              <li>Go to <a href="https://replit.com" target="_blank">Replit.com</a></li>
              <li>Click "Forgot Password" on their login page</li>
              <li>Follow the instructions to reset your Replit account password</li>
              <li>Return here and log in with your new password</li>
            </ol>
          </div>
          <a href="/api/login" class="btn">Back to Login</a>
        </div>
      </body>
      </html>
    `);
  });

  // Add planner API routes for the HTML planner  
  const { default: plannerRoutes } = await import("./plannerRoutes.js");
  app.use("/api/planner", plannerRoutes);

  // AI Curriculum Analysis endpoint
  app.post('/api/curriculum/analyze', async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      // Remove data URL prefix if present
      const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const lessons = await analyzeCurriculumImage(base64Image);
      
      res.json({ lessons });
    } catch (error) {
      console.error('Error analyzing curriculum:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze curriculum image' });
    }
  });

  // Enhanced Curriculum Import Routes
  app.post("/api/curriculums/import/csv", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { curriculumName, curriculumSubject, publisher, gradeLevel, lessons } = req.body;
      
      if (!curriculumName || !curriculumSubject || !lessons || !Array.isArray(lessons)) {
        return res.status(400).json({ error: "Invalid data format" });
      }
      
      // Create the curriculum
      const curriculumData = {
        parentId: userId,
        name: curriculumName,
        subject: curriculumSubject,
        publisher: publisher || null,
        gradeLevel: gradeLevel || null,
        description: `Imported from CSV - ${lessons.length} lessons`,
        totalLessons: lessons.length,
      };

      const curriculum = await storage.createCurriculum(curriculumData);
      
      // Add lessons
      const lessonPromises = lessons.map((lesson: any, index: number) => {
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
        lessonsImported: lessons.length,
        message: `Successfully imported "${curriculum.name}" with ${lessons.length} lessons`
      });
    } catch (error: any) {
      console.error("Error importing CSV curriculum:", error);
      res.status(500).json({ error: "Failed to import curriculum" });
    }
  });

  app.post("/api/curriculums/parse", isAuthenticated, async (req: any, res) => {
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
    } catch (error: any) {
      console.error("Error parsing content:", error);
      res.status(500).json({ error: "Failed to parse content" });
    }
  });

  app.get("/api/curriculums/templates", async (req, res) => {
    try {
      const templates = getCurriculumTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/curriculums/templates/:templateId", async (req, res) => {
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

  // Serve curriculum import page
  app.get('/curriculum-import', async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'static-curriculum-import.html');
      const htmlContent = await fs.readFile(filePath, 'utf8');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving curriculum import page:', error);
      res.status(500).send('Error loading curriculum import page');
    }
  });

  // Serve static login page
  app.get('/login', async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'static-login.html');
      const htmlContent = await fs.readFile(filePath, 'utf8');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving login page:', error);
      res.status(500).send('Error loading login page');
    }
  });

  // Serve static dashboard
  app.get('/static-dashboard', async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'static-dashboard.html');
      const htmlContent = await fs.readFile(filePath, 'utf8');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving dashboard:', error);
      res.status(500).send('Error loading dashboard');
    }
  });

  // Serve static student view
  app.get('/student-view', async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'static-student.html');
      const htmlContent = await fs.readFile(filePath, 'utf8');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving student view:', error);
      res.status(500).send('Error loading student view');
    }
  });

  // Serve static parent view
  app.get('/parent-view', async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'static-parent.html');
      const htmlContent = await fs.readFile(filePath, 'utf8');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving parent view:', error);
      res.status(500).send('Error loading parent view');
    }
  });

  // Serve static planner that bypasses Vite completely (requires teacher login)
  app.get('/static-planner', async (req, res) => {
    try {
      const filePath = path.join(__dirname, '..', 'static-planner.html');
      const htmlContent = await fs.readFile(filePath, 'utf8');
      res.send(htmlContent);
    } catch (error) {
      console.error('Error serving planner:', error);
      res.status(500).send('Error loading planner');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

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
    },
    "apologia-general-science": {
      name: "Apologia General Science",
      subject: "Science",
      publisher: "Apologia",
      gradeLevel: "Middle School",
      description: "Apologia General Science complete curriculum",
      lessons: generateApologiaGeneralScience()
    },
    "trail-guide-geography": {
      name: "Trail Guide to Geography",
      subject: "Geography",
      publisher: "Geography Matters",
      gradeLevel: "Elementary",
      description: "Trail Guide to Geography complete curriculum",
      lessons: generateTrailGuideGeography()
    }
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
    if (i % 10 === 0 && i <= 110) {
      type = 'review';
      title = `Investigation ${Math.floor(i / 10)}`;
      estimatedMinutes = 45;
    }
    
    // Add tests every 20 lessons
    if (i % 20 === 0) {
      lessons.push({
        lessonNumber: i,
        title: `Test ${Math.floor(i / 20)}`,
        type: 'test',
        estimatedMinutes: 50,
        description: `Saxon Math 7/6 - Test ${Math.floor(i / 20)}`
      });
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
  
  for (let i = 1; i <= 122; i++) {
    let type = 'lesson';
    let title = `Lesson ${i}`;
    let estimatedMinutes = 35;
    
    // Add quizzes every 15 lessons
    if (i % 15 === 0 && i <= 120) {
      lessons.push({
        lessonNumber: i,
        title: `Quiz ${Math.floor(i / 15)}`,
        type: 'quiz',
        estimatedMinutes: 25,
        description: `Teaching Textbooks Algebra 1 - Quiz ${Math.floor(i / 15)}`
      });
    }
    
    // Add tests every 30 lessons
    if (i % 30 === 0) {
      lessons.push({
        lessonNumber: i,
        title: `Test ${Math.floor(i / 30)}`,
        type: 'test',
        estimatedMinutes: 45,
        description: `Teaching Textbooks Algebra 1 - Test ${Math.floor(i / 30)}`
      });
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

// Generate Apologia General Science lesson structure
function generateApologiaGeneralScience() {
  const modules = [
    "The Science of Life", "Scientific Analysis", "Living Organisms", "Ecosystems",
    "The Physical Environment", "Weather and Its Prediction", "The Structure of Earth",
    "Geology", "Chemistry and Physics", "Motion and Forces", "Energy and Waves",
    "Electricity and Magnetism", "Atomic Structure", "Chemistry in Action",
    "The Human Body", "The Planet Earth"
  ];
  
  const lessons = [];
  
  modules.forEach((module, index) => {
    const moduleNumber = index + 1;
    
    // Main module lesson
    lessons.push({
      lessonNumber: moduleNumber * 3 - 2,
      title: `Module ${moduleNumber}: ${module}`,
      type: 'lesson',
      estimatedMinutes: 60,
      description: `Apologia General Science - Module ${moduleNumber}`
    });
    
    // Experiment/Lab
    lessons.push({
      lessonNumber: moduleNumber * 3 - 1,
      title: `Module ${moduleNumber} Experiments`,
      type: 'lesson',
      estimatedMinutes: 90,
      description: `Hands-on experiments for Module ${moduleNumber}`
    });
    
    // Module test
    lessons.push({
      lessonNumber: moduleNumber * 3,
      title: `Module ${moduleNumber} Test`,
      type: 'test',
      estimatedMinutes: 45,
      description: `Assessment for Module ${moduleNumber}`
    });
  });
  
  return lessons;
}

// Generate Trail Guide to Geography lesson structure
function generateTrailGuideGeography() {
  const regions = [
    "United States", "Canada", "Mexico and Central America", "South America",
    "United Kingdom", "Europe", "Russia", "Middle East", "Africa",
    "South and East Asia", "Australia and Oceania", "Arctic"
  ];
  
  const lessons = [];
  
  regions.forEach((region, index) => {
    const weekNumber = index + 1;
    
    // Main region study (3 weeks per region)
    for (let week = 1; week <= 3; week++) {
      const lessonNumber = (index * 3) + week;
      
      lessons.push({
        lessonNumber: lessonNumber,
        title: `${region} - Week ${week}`,
        type: 'lesson',
        estimatedMinutes: 45,
        description: `Trail Guide Geography - ${region} study week ${week}`
      });
    }
  });
  
  return lessons;
}
