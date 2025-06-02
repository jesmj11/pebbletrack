import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authStorage } from "./storage-auth";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertClassSchema, 
  insertStudentSchema,
  insertAssignmentSchema,
  insertTaskSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup sessions
  app.use(
    session({
      secret: "edutask-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
      store: new SessionStore({ checkPeriod: 86400000 }) // prune expired entries every 24h
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await authStorage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }
        const isValidPassword = await authStorage.validatePassword(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }
        await authStorage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await authStorage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await authStorage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const user = await authStorage.createUser(userData);
      res.status(201).json({ message: "Account created successfully", userId: user.id });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User routes
  app.get("/api/users", isAuthenticated, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Class routes
  app.get("/api/classes", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    if (user.role === "teacher") {
      const classes = await storage.getClassesByTeacher(user.id);
      res.json(classes);
    } else {
      const student = (await storage.getStudents()).find(
        s => s.userId === user.id
      );
      if (!student) {
        return res.json([]);
      }
      
      const allClasses = await storage.getClasses();
      const studentClasses = allClasses.filter(c => 
        student.classIds.includes(c.id.toString())
      );
      res.json(studentClasses);
    }
  });

  app.post("/api/classes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create classes" });
      }
      
      const classData = insertClassSchema.parse({
        ...req.body,
        teacherId: user.id
      });
      
      const newClass = await storage.createClass(classData);
      res.status(201).json(newClass);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/classes/:id", isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      const user = req.user as any;
      
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (existingClass.teacherId !== user.id) {
        return res.status(403).json({ message: "You can only modify your own classes" });
      }
      
      const updatedClass = await storage.updateClass(classId, req.body);
      res.json(updatedClass);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete("/api/classes/:id", isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      const user = req.user as any;
      
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (existingClass.teacherId !== user.id) {
        return res.status(403).json({ message: "You can only delete your own classes" });
      }
      
      await storage.deleteClass(classId);
      res.json({ message: "Class deleted" });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Student routes
  app.get("/api/students", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    if (user.role !== "teacher") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const students = await storage.getStudentsWithUserData();
    res.json(students);
  });

  app.get("/api/classes/:id/students", isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      const user = req.user as any;
      
      const existingClass = await storage.getClass(classId);
      if (!existingClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      
      if (user.role === "teacher" && existingClass.teacherId !== user.id) {
        return res.status(403).json({ message: "You can only access your own classes" });
      }
      
      const students = await storage.getStudentsByClass(classId);
      res.json(students);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.post("/api/students", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create students" });
      }
      
      // First create a user
      const newUser = await storage.createUser({
        username: req.body.username,
        password: req.body.password || "password123", // Default password
        role: "student",
        fullName: req.body.fullName
      });
      
      // Then create a student linked to that user
      const studentData = insertStudentSchema.parse({
        userId: newUser.id,
        classIds: req.body.classIds || []
      });
      
      const student = await storage.createStudent(studentData);
      
      // Return combined data
      res.status(201).json({
        ...student,
        user: newUser
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.put("/api/students/:id", isAuthenticated, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const user = req.user as any;
      
      if (user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can update students" });
      }
      
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Update student class IDs
      if (req.body.classIds !== undefined) {
        await storage.updateStudent(studentId, {
          ...student,
          classIds: req.body.classIds
        });
      }
      
      // If user data is provided, update the user
      if (req.body.fullName) {
        const studentUser = await storage.getUser(student.userId);
        if (studentUser) {
          // We can't use storage.updateUser since we didn't define it
          // This is just a workaround for the demo
          studentUser.fullName = req.body.fullName;
        }
      }
      
      const updatedStudent = await storage.getStudent(studentId);
      const studentUser = await storage.getUser(student.userId);
      
      res.json({
        ...updatedStudent,
        user: studentUser
      });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Assignment routes
  app.get("/api/assignments", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    if (user.role === "teacher") {
      const assignments = await storage.getAssignments();
      res.json(assignments);
    } else {
      // For students, get assignments via tasks
      const student = (await storage.getStudents()).find(
        s => s.userId === user.id
      );
      
      if (!student) {
        return res.json([]);
      }
      
      const tasks = await storage.getTasksByStudent(student.id);
      const assignments = tasks.map(task => task.assignment);
      
      // Remove duplicates
      const uniqueAssignments = assignments.filter(
        (assignment, index, self) =>
          index === self.findIndex(a => a.id === assignment.id)
      );
      
      res.json(uniqueAssignments);
    }
  });

  app.post("/api/assignments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create assignments" });
      }
      
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    if (user.role === "teacher") {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } else {
      const student = (await storage.getStudents()).find(
        s => s.userId === user.id
      );
      
      if (!student) {
        return res.json([]);
      }
      
      const tasks = await storage.getTasksByStudent(student.id);
      res.json(tasks);
    }
  });

  app.get("/api/student/tasks", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    
    if (user.role !== "student") {
      return res.status(403).json({ message: "Only for students" });
    }
    
    const student = (await storage.getStudents()).find(
      s => s.userId === user.id
    );
    
    if (!student) {
      return res.json([]);
    }
    
    const tasks = await storage.getTasksByStudent(student.id);
    res.json(tasks);
  });

  app.put("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const user = req.user as any;
      
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Students can only update their own tasks' completion status
      if (user.role === "student") {
        const student = (await storage.getStudents()).find(
          s => s.userId === user.id
        );
        
        if (!student || student.id !== task.studentId) {
          return res.status(403).json({ message: "You can only update your own tasks" });
        }
        
        // Students can only toggle completion status
        if (req.body.completed !== undefined) {
          const completedAt = req.body.completed ? new Date() : null;
          
          const updatedTask = await storage.updateTask(taskId, {
            ...task,
            completed: req.body.completed,
            completedAt
          });
          
          res.json(updatedTask);
        } else {
          res.status(400).json({ message: "Only completion status can be updated" });
        }
      } else {
        // Teachers can update any task
        const updatedTask = await storage.updateTask(taskId, req.body);
        res.json(updatedTask);
      }
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/teacher", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role !== "teacher") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const classesWithCount = await storage.getClassesWithStudentCount(user.id);
      const studentProgress = await storage.getStudentProgress(user.id);
      const completionRate = await storage.getTaskCompletionRate(user.id);
      
      res.json({
        classes: classesWithCount,
        studentProgress,
        completionRate
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.get("/api/dashboard/student", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const student = (await storage.getStudents()).find(
        s => s.userId === user.id
      );
      
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
      
      const tasks = await storage.getTasksByStudent(student.id);
      const completedTasks = tasks.filter(task => task.completed);
      const pendingTasks = tasks.filter(task => !task.completed);
      
      // Group tasks by class for progress calculation
      const classTasks = tasks.reduce((acc, task) => {
        const classId = task.class.id;
        if (!acc[classId]) {
          acc[classId] = {
            className: task.class.name,
            total: 0,
            completed: 0
          };
        }
        acc[classId].total++;
        if (task.completed) acc[classId].completed++;
        return acc;
      }, {} as Record<number, { className: string; total: number; completed: number }>);
      
      const progress = Object.values(classTasks).map(ct => ({
        className: ct.className,
        percentage: ct.total > 0 ? (ct.completed / ct.total) * 100 : 0
      }));
      
      res.json({
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        dueTodayTasks: pendingTasks.filter(task => {
          const dueDate = new Date(task.assignment.dueDate);
          const today = new Date();
          return dueDate.toDateString() === today.toDateString();
        }).length,
        totalClasses: student.classIds.length,
        progress
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
