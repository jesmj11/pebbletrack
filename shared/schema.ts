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

// Curriculum tables for lesson management
export const curriculums = pgTable("curriculums", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(), // who uploaded this curriculum
  name: text("name").notNull(), // "Saxon Math 7/6", "Teaching Textbooks Algebra 1"
  subject: text("subject").notNull(), // "Math", "Science", "History", etc.
  publisher: text("publisher"), // "Saxon", "Teaching Textbooks", etc.
  gradeLevel: text("grade_level"), // "7th Grade", "High School"
  description: text("description"),
  totalLessons: integer("total_lessons").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const curriculumLessons = pgTable("curriculum_lessons", {
  id: serial("id").primaryKey(),
  curriculumId: integer("curriculum_id").notNull(),
  lessonNumber: integer("lesson_number").notNull(), // 1, 2, 3, etc.
  title: text("title").notNull(), // "Adding Fractions", "Quiz 5", etc.
  type: text("type").notNull().default("lesson"), // "lesson", "quiz", "test", "review"
  description: text("description"),
  estimatedMinutes: integer("estimated_minutes").default(30),
  prerequisites: text("prerequisites"), // JSON array of lesson IDs that must be completed first
});

export const studentCurriculums = pgTable("student_curriculums", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  curriculumId: integer("curriculum_id").notNull(),
  lessonsPerDay: integer("lessons_per_day").notNull().default(1),
  startDate: timestamp("start_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  currentLesson: integer("current_lesson").default(1),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  curriculumId: integer("curriculum_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  status: text("status").notNull().default("not_started"), // "not_started", "in_progress", "completed", "skipped"
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent_minutes").default(0),
  notes: text("notes"), // for parent/student notes
  score: integer("score"), // for quizzes/tests (0-100)
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

// New curriculum schemas
export const insertCurriculumSchema = createInsertSchema(curriculums).pick({
  parentId: true,
  name: true,
  subject: true,
  publisher: true,
  gradeLevel: true,
  description: true,
  totalLessons: true,
});

export const insertCurriculumLessonSchema = createInsertSchema(curriculumLessons).pick({
  curriculumId: true,
  lessonNumber: true,
  title: true,
  type: true,
  description: true,
  estimatedMinutes: true,
  prerequisites: true,
});

export const insertStudentCurriculumSchema = createInsertSchema(studentCurriculums).pick({
  studentId: true,
  curriculumId: true,
  lessonsPerDay: true,
  startDate: true,
  isActive: true,
  currentLesson: true,
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).pick({
  studentId: true,
  curriculumId: true,
  lessonId: true,
  status: true,
  completedAt: true,
  timeSpent: true,
  notes: true,
  score: true,
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

// Curriculum types
export type Curriculum = typeof curriculums.$inferSelect;
export type InsertCurriculum = z.infer<typeof insertCurriculumSchema>;

export type CurriculumLesson = typeof curriculumLessons.$inferSelect;
export type InsertCurriculumLesson = z.infer<typeof insertCurriculumLessonSchema>;

export type StudentCurriculum = typeof studentCurriculums.$inferSelect;
export type InsertStudentCurriculum = z.infer<typeof insertStudentCurriculumSchema>;

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;

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

export type CurriculumWithProgress = Curriculum & {
  lessonsCompleted: number;
  totalLessons: number;
  currentLessonTitle: string;
  nextLessons: CurriculumLesson[];
};

export type StudentDailyLessons = {
  studentId: number;
  studentName: string;
  curriculums: Array<{
    id: number;
    name: string;
    subject: string;
    todaysLessons: CurriculumLesson[];
    lessonsPerDay: number;
    progress: number;
  }>;
};
