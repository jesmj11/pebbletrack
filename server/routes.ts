import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-replit";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
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

  const httpServer = createServer(app);
  return httpServer;
}