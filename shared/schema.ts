import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("parent"), // "parent" or "student"
  fullName: text("full_name").notNull(),
  familyName: text("family_name"), // e.g., "The Johnson Family"
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: integer("teacher_id").notNull(),
  gradeLevel: text("grade_level"),
  description: text("description"),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(), // references users.id (parent)
  fullName: text("full_name").notNull(),
  gradeLevel: text("grade_level").notNull(), // "2nd Grade", "5th Grade", etc.
  avatar: text("avatar").default("👧"), // emoji avatar
  level: integer("level").default(1), // gamification level
  xp: integer("xp").default(0), // experience points
  totalXp: integer("total_xp").default(500), // XP needed for next level
  pin: text("pin"), // 4-digit PIN for student login
  createdAt: timestamp("created_at").defaultNow(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  classId: integer("class_id").notNull(),
  dueDate: timestamp("due_date").notNull(),
  priority: text("priority").notNull().default("medium"), // "low", "medium", "high"
  createdBy: integer("created_by").notNull(), // teacher's userId
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  studentId: integer("student_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
  fullName: true,
  familyName: true,
});

export const insertStudentSchema = createInsertSchema(students).pick({
  parentId: true,
  fullName: true,
  gradeLevel: true,
  avatar: true,
  level: true,
  xp: true,
  totalXp: true,
  pin: true,
});

export const insertClassSchema = createInsertSchema(classes).pick({
  name: true,
  teacherId: true,
  gradeLevel: true,
  description: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).pick({
  title: true,
  description: true,
  classId: true,
  dueDate: true,
  priority: true,
  createdBy: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  assignmentId: true,
  studentId: true,
  completed: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Extended types for frontend
export type StudentWithUser = Student & {
  user: User;
};

export type TaskWithAssignment = Task & {
  assignment: Assignment;
  class: Class;
};

export type ClassWithStudentCount = Class & {
  studentCount: number;
};

export type StudentProgress = {
  studentId: number;
  fullName: string;
  className: string;
  completedTasks: number;
  pendingTasks: number;
  progressPercentage: number;
};
