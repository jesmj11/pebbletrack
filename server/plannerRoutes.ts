import { Router } from "express";
import { z } from "zod";
import { storage } from "./storage-replit";
import { insertPlannerTaskSchema } from "../shared/schema";

const router = Router();

// Class schema for validation
const createClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().optional(),
  studentId: z.string().optional(),
  location: z.string().optional(),
  meetingTime: z.string().optional(),
});

const updateClassSchema = z.object({
  completed: z.boolean(),
});

// Get classes for a specific week (organized by day-student combinations)
router.get("/classes", async (req, res) => {
  try {
    const { week } = req.query;
    const allClasses = await storage.getAllTasks();
    
    if (week) {
      // For now, return all classes regardless of week
      // Later we can filter by week when we have proper date tracking
      const weekClasses = allClasses;
      
      // Transform into the format expected by frontend: { "monday-0": [...], "tuesday-1": [...] }
      const organizedClasses: Record<string, any[]> = {};
      weekClasses.forEach(task => {
        // For now, place all classes in the first student column on Monday
        // This is a temporary solution until we have proper day/student tracking
        const cellKey = "monday-0";
        if (!organizedClasses[cellKey]) {
          organizedClasses[cellKey] = [];
        }
        organizedClasses[cellKey].push(task);
      });
      
      res.json(organizedClasses);
    } else {
      res.json(allClasses);
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Legacy endpoint for backwards compatibility
router.get("/tasks", async (req, res) => {
  try {
    const allTasks = await storage.getAllTasks();
    res.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create a new class
router.post("/classes", async (req, res) => {
  try {
    const validatedData = createClassSchema.parse(req.body);
    
    const classData = {
      id: Date.now().toString(), // Simple ID generation
      title: validatedData.title,
      subject: validatedData.subject,
      description: "",
      day: "monday", // Default to Monday for now
      studentIndex: 0, // Default to first student
      weekKey: new Date().toISOString().split('T')[0], // Current date as week key
      completed: false,
      studentId: validatedData.studentId ? parseInt(validatedData.studentId) : null,
      location: validatedData.location || null,
      meetingTime: validatedData.meetingTime || null,
    };

    const newClass = await storage.createPlannerTask(classData);
    res.json(newClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error creating class:", error);
      res.status(500).json({ error: "Failed to create class" });
    }
  }
});

// Legacy endpoint for backwards compatibility
router.post("/tasks", async (req, res) => {
  try {
    const validatedData = createClassSchema.parse(req.body);
    
    const taskData = {
      id: Date.now().toString(), // Simple ID generation
      title: validatedData.title,
      subject: validatedData.subject,
      description: "",
      day: "monday", // Default to Monday for now
      studentIndex: 0, // Default to first student
      weekKey: new Date().toISOString().split('T')[0], // Current date as week key
      completed: false,
      studentId: validatedData.studentId ? parseInt(validatedData.studentId) : null,
      location: validatedData.location || null,
      meetingTime: validatedData.meetingTime || null,
    };

    const newTask = await storage.createPlannerTask(taskData);
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

// Update a class (toggle completion)
router.patch("/classes/:id", async (req, res) => {
  try {
    const classId = req.params.id;
    const validatedData = updateClassSchema.parse(req.body);

    const updatedClass = await storage.updatePlannerTask(classId, { completed: validatedData.completed });
    
    if (!updatedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json(updatedClass);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Error updating class:", error);
      res.status(500).json({ error: "Failed to update class" });
    }
  }
});

// Legacy: Update a task (toggle completion)
router.patch("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const validatedData = updateClassSchema.parse(req.body);

    const updatedTask = await storage.updatePlannerTask(taskId, { completed: validatedData.completed });
    
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

// Delete a class
router.delete("/classes/:id", async (req, res) => {
  try {
    const classId = req.params.id;
    const deleted = await storage.deletePlannerTask(classId);

    if (!deleted) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ error: "Failed to delete class" });
  }
});

// Legacy: Delete a task
router.delete("/tasks/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const deleted = await storage.deletePlannerTask(taskId);

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

// Get all students
router.get("/students", async (req, res) => {
  try {
    const allStudents = await storage.getStudents();
    res.json(allStudents);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// Create a new student
router.post("/students", async (req, res) => {
  try {
    const studentData = {
      parentId: "demo-parent", // For demo purposes
      fullName: req.body.fullName,
      gradeLevel: req.body.gradeLevel,
    };

    const newStudent = await storage.createStudent(studentData);
    res.json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// Delete a student
router.delete("/students/:id", async (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const deleted = await storage.deleteStudent(studentId);

    if (!deleted) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// Co-Op Group Management APIs

// Get all co-op groups
router.get("/coop-groups", async (req, res) => {
  try {
    const allGroups = await storage.getCoopGroups();
    res.json(allGroups);
  } catch (error) {
    console.error("Error fetching co-op groups:", error);
    res.status(500).json({ error: "Failed to fetch co-op groups" });
  }
});

// Create a new co-op group
router.post("/coop-groups", async (req, res) => {
  try {
    const groupData = {
      parentId: "demo-parent", // For demo purposes
      name: req.body.name,
      subject: req.body.subject,
      location: req.body.location,
      meetingDay: req.body.meetingDay,
      meetingTime: req.body.meetingTime,
      description: req.body.description,
      isActive: true,
    };

    const newGroup = await storage.createCoopGroup(groupData);
    res.json(newGroup);
  } catch (error) {
    console.error("Error creating co-op group:", error);
    res.status(500).json({ error: "Failed to create co-op group" });
  }
});

// Add student to co-op group
router.post("/coop-groups/:id/members", async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const memberData = {
      groupId: groupId,
      studentId: parseInt(req.body.studentId),
      role: req.body.role || "member",
    };

    const newMember = await storage.addCoopGroupMember(memberData);
    res.json(newMember);
  } catch (error) {
    console.error("Error adding group member:", error);
    res.status(500).json({ error: "Failed to add group member" });
  }
});

// Remove student from co-op group
router.delete("/coop-groups/:groupId/members/:studentId", async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const studentId = parseInt(req.params.studentId);
    
    const removed = await storage.removeCoopGroupMember(groupId, studentId);
    
    if (!removed) {
      return res.status(404).json({ error: "Group member not found" });
    }

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing group member:", error);
    res.status(500).json({ error: "Failed to remove group member" });
  }
});

export default router;