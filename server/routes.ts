import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { fileURLToPath } from "url";
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

  // Serve static planner that bypasses Vite completely
  app.get('/static-planner', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Homeschool Planner - Static Version</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: #f8fafc;
            min-height: 100vh;
            line-height: 1.6;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 0.5rem;
        }
        
        .subtitle {
            color: #64748b;
            font-size: 1.1rem;
        }
        
        .card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
        }
        
        .form-row {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
        }
        
        input {
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            font-family: inherit;
        }
        
        input[type="text"]:first-child {
            flex: 2;
            min-width: 200px;
        }
        
        input[type="text"]:nth-child(2) {
            flex: 1;
            min-width: 120px;
        }
        
        button {
            background-color: #3b82f6;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            font-family: inherit;
            transition: background-color 0.2s;
        }
        
        button:hover {
            background-color: #2563eb;
        }
        
        .delete-btn {
            background-color: #ef4444;
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        
        .delete-btn:hover {
            background-color: #dc2626;
        }
        
        .task-list {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .task-header {
            padding: 1.5rem;
            background-color: #f8fafc;
            border-bottom: 1px solid #e5e7eb;
            color: #374151;
            margin: 0;
            font-size: 1.25rem;
        }
        
        .task-item {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: background-color 0.2s;
        }
        
        .task-item:last-child {
            border-bottom: none;
        }
        
        .task-item.completed {
            background-color: #f0f9ff;
        }
        
        .task-content {
            flex: 1;
        }
        
        .task-title {
            font-size: 1.1rem;
            margin-bottom: 0.25rem;
            font-weight: 500;
        }
        
        .task-title.completed {
            text-decoration: line-through;
            color: #6b7280;
            font-weight: normal;
        }
        
        .task-meta {
            font-size: 0.9rem;
            color: #6b7280;
        }
        
        .stats {
            margin-top: 2rem;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .stat-number.completed { color: #059669; }
        .stat-number.remaining { color: #dc2626; }
        .stat-number.total { color: #3b82f6; }
        
        .stat-label {
            color: #6b7280;
            font-size: 1rem;
        }
        
        .empty-state {
            padding: 3rem 2rem;
            text-align: center;
            color: #6b7280;
            font-size: 1.1rem;
        }

        .status-indicator {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-left: 0.5rem;
        }

        .status-online {
            background-color: #dcfce7;
            color: #166534;
        }

        .status-offline {
            background-color: #fef2f2;
            color: #991b1b;
        }

        .subject-tag {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background-color: #f1f5f9;
            color: #475569;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .student-card {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            min-width: 200px;
            position: relative;
        }

        .student-card.selected {
            border-color: #3b82f6;
            background: #eff6ff;
        }

        .student-avatar {
            font-size: 2rem;
        }

        .student-info h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
        }

        .student-info p {
            margin: 0;
            font-size: 0.85rem;
            color: #6b7280;
        }

        .student-delete {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .form-row {
                flex-direction: column;
            }
            
            input {
                min-width: unset !important;
            }
            
            .task-item {
                flex-wrap: wrap;
                gap: 0.75rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Homeschool Planner</h1>
            <p class="subtitle">
                Manage your daily learning tasks
                <span id="connectionStatus" class="status-indicator status-offline">Offline Mode</span>
            </p>
        </header>

        <!-- Student Management -->
        <div class="card">
            <h2 style="margin-bottom: 1rem; color: #374151;">Students</h2>
            <div id="studentContainer" style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                <!-- Students will be rendered here -->
            </div>
            <form id="studentForm" style="display: flex; gap: 1rem; align-items: end;">
                <div>
                    <input type="text" id="studentName" placeholder="Student name" required style="width: 200px;">
                </div>
                <div>
                    <select id="studentGrade" required style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="">Select Grade</option>
                        <option value="Pre-K">Pre-K</option>
                        <option value="Kindergarten">Kindergarten</option>
                        <option value="1st Grade">1st Grade</option>
                        <option value="2nd Grade">2nd Grade</option>
                        <option value="3rd Grade">3rd Grade</option>
                        <option value="4th Grade">4th Grade</option>
                        <option value="5th Grade">5th Grade</option>
                        <option value="6th Grade">6th Grade</option>
                        <option value="7th Grade">7th Grade</option>
                        <option value="8th Grade">8th Grade</option>
                        <option value="High School">High School</option>
                    </select>
                </div>
                <button type="submit">Add Student</button>
            </form>
        </div>

        <!-- Add New Task Form -->
        <div class="card">
            <h2 style="margin-bottom: 1rem; color: #374151;">Add New Task</h2>
            <form id="taskForm">
                <div class="form-row">
                    <input type="text" id="taskTitle" placeholder="Task title" required>
                    <input type="text" id="taskSubject" placeholder="Subject" required>
                    <select id="taskStudent" style="padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="">All Students</option>
                        <!-- Students will be populated here -->
                    </select>
                    <input type="date" id="taskDate">
                </div>
                <button type="submit">Add Task</button>
            </form>
        </div>

        <!-- Tasks List -->
        <div class="task-list">
            <h2 class="task-header" id="taskHeader">Today's Tasks (0 remaining)</h2>
            <div id="taskContainer">
                <div class="empty-state">
                    No tasks yet. Add your first task above!
                </div>
            </div>
        </div>

        <!-- Stats -->
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number completed" id="completedCount">0</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number remaining" id="remainingCount">0</div>
                <div class="stat-label">Remaining</div>
            </div>
            <div class="stat-card">
                <div class="stat-number total" id="totalCount">0</div>
                <div class="stat-label">Total Tasks</div>
            </div>
        </div>
    </div>

    <script>
        let tasks = [];
        let students = [];
        let isOnline = false;
        
        // Check if we can connect to the API
        async function checkConnection() {
            try {
                const response = await fetch('/api/planner/tasks', { method: 'HEAD' });
                isOnline = response.ok;
            } catch (error) {
                isOnline = false;
            }
            
            const statusEl = document.getElementById('connectionStatus');
            if (isOnline) {
                statusEl.textContent = 'Online';
                statusEl.className = 'status-indicator status-online';
            } else {
                statusEl.textContent = 'Offline Mode';
                statusEl.className = 'status-indicator status-offline';
            }
        }

        // Load students from API or localStorage
        async function loadStudents() {
            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/students');
                    if (response.ok) {
                        students = await response.json();
                        localStorage.setItem('homeschool_students', JSON.stringify(students));
                    } else {
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.warn('Failed to load students from API, using localStorage');
                    loadStudentsFromLocalStorage();
                }
            } else {
                loadStudentsFromLocalStorage();
            }
            renderStudents();
        }

        function loadStudentsFromLocalStorage() {
            const saved = localStorage.getItem('homeschool_students');
            if (saved) {
                students = JSON.parse(saved);
            } else {
                // Default sample students
                students = [
                    { id: 1, fullName: "Emma Johnson", gradeLevel: "3rd Grade", avatar: "👧" },
                    { id: 2, fullName: "Liam Johnson", gradeLevel: "5th Grade", avatar: "👦" }
                ];
                saveStudentsToLocalStorage();
            }
        }

        function saveStudentsToLocalStorage() {
            localStorage.setItem('homeschool_students', JSON.stringify(students));
        }

        // Load tasks from API or localStorage
        async function loadTasks() {
            await checkConnection();
            
            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/tasks');
                    if (response.ok) {
                        tasks = await response.json();
                        // Save to localStorage as backup
                        localStorage.setItem('homeschool_tasks', JSON.stringify(tasks));
                    } else {
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.warn('Failed to load from API, using localStorage');
                    loadFromLocalStorage();
                }
            } else {
                loadFromLocalStorage();
            }
            
            renderTasks();
        }

        function loadFromLocalStorage() {
            const saved = localStorage.getItem('homeschool_tasks');
            if (saved) {
                tasks = JSON.parse(saved);
            } else {
                // Default sample tasks
                tasks = [
                    {
                        id: "sample-1",
                        title: "Math Practice - Addition",
                        subject: "Math",
                        completed: false,
                        dueDate: "2025-01-21"
                    },
                    {
                        id: "sample-2", 
                        title: "Read Chapter 3",
                        subject: "Reading",
                        completed: true,
                        dueDate: "2025-01-20"
                    },
                    {
                        id: "sample-3",
                        title: "Science Experiment - Plants",
                        subject: "Science", 
                        completed: false,
                        dueDate: "2025-01-22"
                    }
                ];
                saveToLocalStorage();
            }
        }

        function saveToLocalStorage() {
            localStorage.setItem('homeschool_tasks', JSON.stringify(tasks));
        }

        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }

        function updateStats() {
            const completed = tasks.filter(t => t.completed).length;
            const remaining = tasks.filter(t => !t.completed).length;
            const total = tasks.length;

            document.getElementById('completedCount').textContent = completed;
            document.getElementById('remainingCount').textContent = remaining;
            document.getElementById('totalCount').textContent = total;
            document.getElementById('taskHeader').textContent = "Today's Tasks (" + remaining + " remaining)";
        }

        function getSubjectColor(subject) {
            const colors = {
                'Math': '#fef3c7',
                'Reading': '#dbeafe', 
                'Science': '#dcfce7',
                'History': '#fce7f3',
                'Art': '#f3e8ff',
                'PE': '#fed7d7'
            };
            return colors[subject] || '#f1f5f9';
        }

        function getStudentName(studentId) {
            const student = students.find(s => s.id === studentId);
            return student ? student.fullName : 'Unknown';
        }

        function renderTasks() {
            const container = document.getElementById('taskContainer');
            
            if (tasks.length === 0) {
                container.innerHTML = '<div class="empty-state">No tasks yet. Add your first task above!</div>';
                updateStats();
                return;
            }

            container.innerHTML = tasks.map(task => 
                '<div class="task-item ' + (task.completed ? 'completed' : '') + '">' +
                    '<input type="checkbox" ' + (task.completed ? 'checked' : '') + ' ' +
                           'onchange="toggleTask(\\''+task.id+'\\')" style="transform: scale(1.2);">' +
                    '<div class="task-content">' +
                        '<div class="task-title ' + (task.completed ? 'completed' : '') + '">' + task.title + '</div>' +
                        '<div class="task-meta">' +
                            '<span class="subject-tag" style="background-color: ' + getSubjectColor(task.subject) + '">' + task.subject + '</span>' +
                            (task.studentId ? ' • ' + getStudentName(task.studentId) : '') +
                            ' • Due: ' + formatDate(task.dueDate) +
                        '</div>' +
                    '</div>' +
                    '<button class="delete-btn" onclick="deleteTask(\\''+task.id+'\\')">Delete</button>' +
                '</div>'
            ).join('');

            updateStats();
        }

        function renderStudents() {
            const container = document.getElementById('studentContainer');
            const select = document.getElementById('taskStudent');
            
            if (students.length === 0) {
                container.innerHTML = '<p style="color: #6b7280;">No students added yet.</p>';
            } else {
                container.innerHTML = students.map(student => 
                    '<div class="student-card" onclick="selectStudent(' + student.id + ')">' +
                        '<button class="student-delete" onclick="deleteStudent(' + student.id + '); event.stopPropagation();">×</button>' +
                        '<div class="student-avatar">' + student.avatar + '</div>' +
                        '<div class="student-info">' +
                            '<h3>' + student.fullName + '</h3>' +
                            '<p>' + student.gradeLevel + '</p>' +
                        '</div>' +
                    '</div>'
                ).join('');
            }

            // Update task form student dropdown
            select.innerHTML = '<option value="">All Students</option>' + 
                students.map(student => 
                    '<option value="' + student.id + '">' + student.fullName + '</option>'
                ).join('');
        }

        async function addStudent(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('studentName').value.trim();
            const gradeLevel = document.getElementById('studentGrade').value;
            
            if (!fullName || !gradeLevel) return;

            const newStudent = {
                id: Date.now(),
                fullName: fullName,
                gradeLevel: gradeLevel,
                avatar: Math.random() > 0.5 ? "👧" : "👦"
            };

            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/students', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newStudent)
                    });

                    if (response.ok) {
                        const createdStudent = await response.json();
                        students.push(createdStudent);
                    } else {
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.warn('Failed to save student online, saving locally');
                    students.push(newStudent);
                }
            } else {
                students.push(newStudent);
            }

            saveStudentsToLocalStorage();
            renderStudents();

            document.getElementById('studentName').value = '';
            document.getElementById('studentGrade').value = '';
        }

        async function deleteStudent(id) {
            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/students/' + id, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) throw new Error('API request failed');
                } catch (error) {
                    console.warn('Failed to delete student online, deleting locally');
                }
            }

            students = students.filter(student => student.id !== id);
            saveStudentsToLocalStorage();
            renderStudents();
        }

        async function addTask(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value.trim();
            const subject = document.getElementById('taskSubject').value.trim();
            const studentId = document.getElementById('taskStudent').value;
            const dueDate = document.getElementById('taskDate').value || new Date().toISOString().split('T')[0];

            if (!title || !subject) return;

            const newTask = {
                id: Date.now().toString(),
                title: title,
                subject: subject,
                completed: false,
                dueDate: dueDate,
                studentId: studentId ? parseInt(studentId) : null
            };

            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newTask)
                    });

                    if (response.ok) {
                        const createdTask = await response.json();
                        tasks.push(createdTask);
                    } else {
                        throw new Error('API request failed');
                    }
                } catch (error) {
                    console.warn('Failed to save online, saving locally');
                    tasks.push(newTask);
                }
            } else {
                tasks.push(newTask);
            }

            saveToLocalStorage();
            renderTasks();

            // Clear form
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskSubject').value = '';
            document.getElementById('taskStudent').value = '';
            document.getElementById('taskDate').value = '';
        }

        async function toggleTask(id) {
            const taskIndex = tasks.findIndex(t => t.id === id);
            if (taskIndex === -1) return;

            const newCompleted = !tasks[taskIndex].completed;

            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/tasks/' + id, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed: newCompleted })
                    });

                    if (!response.ok) throw new Error('API request failed');
                } catch (error) {
                    console.warn('Failed to update online, updating locally');
                }
            }

            tasks[taskIndex].completed = newCompleted;
            saveToLocalStorage();
            renderTasks();
        }

        async function deleteTask(id) {
            if (isOnline) {
                try {
                    const response = await fetch('/api/planner/tasks/' + id, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) throw new Error('API request failed');
                } catch (error) {
                    console.warn('Failed to delete online, deleting locally');
                }
            }

            tasks = tasks.filter(task => task.id !== id);
            saveToLocalStorage();
            renderTasks();
        }

        // Initialize
        document.getElementById('taskForm').addEventListener('submit', addTask);
        document.getElementById('studentForm').addEventListener('submit', addStudent);
        
        // Load data on startup
        loadStudents();
        loadTasks();

        // Check connection periodically
        setInterval(checkConnection, 30000); // Every 30 seconds
    </script>
</body>
</html>`);
  });

  const httpServer = createServer(app);
  return httpServer;
}