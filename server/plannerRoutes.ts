import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage-replit";
import { insertTaskSchema } from "../shared/schema";

const router = Router();

// Task schema for validation
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().optional(),
  studentId: z.string().optional(),
});

const updateTaskSchema = z.object({
  completed: z.boolean(),
});

// Get all tasks
router.get("/tasks", async (req, res) => {
  try {
    const allTasks = await storage.getAllTasks();
    res.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create a new task
router.post("/tasks", async (req, res) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    
    const taskData = {
      title: validatedData.title,
      subject: validatedData.subject,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : new Date(),
      completed: false,
      studentId: validatedData.studentId || null,
    };

    const newTask = await storage.createTask(taskData);
    res.json(newTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  }
});

// Update a task (toggle completion)
router.patch("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const validatedData = updateTaskSchema.parse(req.body);

    const updatedTask = await storage.updateTask(taskId, { completed: validatedData.completed });
    
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  }
});

// Delete a task
router.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const deleted = await storage.deleteTask(taskId);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// Get task statistics
router.get("/stats", async (req, res) => {
  try {
    const allTasks = await storage.getAllTasks();
    
    const stats = {
      total: allTasks.length,
      completed: allTasks.filter(t => t.completed).length,
      remaining: allTasks.filter(t => !t.completed).length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export default router;