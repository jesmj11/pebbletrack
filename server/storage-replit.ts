import {
  users,
  sessions,
  students,
  classes,
  assignments,
  tasks,
  curriculums,
  curriculumLessons,
  studentCurriculums,
  lessonProgress,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type Class,
  type InsertClass,
  type Assignment,
  type InsertAssignment,
  type Task,
  type InsertTask,
  type StudentWithUser,
  type TaskWithAssignment,
  type ClassWithStudentCount,
  type StudentProgress,
  type Curriculum,
  type InsertCurriculum,
  type CurriculumLesson,
  type InsertCurriculumLesson,
  type StudentCurriculum,
  type InsertStudentCurriculum,
  type LessonProgress,
  type InsertLessonProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations (Replit Auth)
export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Class operations
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentsByParent(parentId: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Assignment operations
  getAssignments(): Promise<Assignment[]>;
  getAssignment(id: number): Promise<Assignment | undefined>;
  getAssignmentsByClass(classId: number): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: number, assignmentData: Partial<InsertAssignment>): Promise<Assignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]>;
  getTasksByAssignment(assignmentId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Curriculum operations
  getCurriculums(): Promise<Curriculum[]>;
  getCurriculum(id: number): Promise<Curriculum | undefined>;
  getCurriculumsByParent(parentId: string): Promise<Curriculum[]>;
  createCurriculum(curriculum: InsertCurriculum): Promise<Curriculum>;
  updateCurriculum(id: number, curriculumData: Partial<InsertCurriculum>): Promise<Curriculum | undefined>;
  deleteCurriculum(id: number): Promise<boolean>;
  
  // Curriculum lessons
  getCurriculumLessons(curriculumId: number): Promise<CurriculumLesson[]>;
  createCurriculumLesson(lesson: InsertCurriculumLesson): Promise<CurriculumLesson>;
  updateCurriculumLesson(id: number, lessonData: Partial<InsertCurriculumLesson>): Promise<CurriculumLesson | undefined>;
  
  // Student curriculum assignments
  getStudentCurriculums(studentId: number): Promise<StudentCurriculum[]>;
  createStudentCurriculum(studentCurriculum: InsertStudentCurriculum): Promise<StudentCurriculum>;
  updateStudentCurriculum(id: number, data: Partial<InsertStudentCurriculum>): Promise<StudentCurriculum | undefined>;
  
  // Lesson progress tracking
  getLessonProgress(studentId: number, curriculumId: number): Promise<LessonProgress[]>;
  createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress>;
  updateLessonProgress(id: number, data: Partial<InsertLessonProgress>): Promise<LessonProgress | undefined>;
  
  // Dashboard and reporting operations
  getClassesWithStudentCount(teacherId: string): Promise<ClassWithStudentCount[]>;
  getStudentProgress(teacherId: string): Promise<StudentProgress[]>;
  getTaskCompletionRate(teacherId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  
  // User operations (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Class operations
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }
  
  async getClass(id: number): Promise<Class | undefined> {
    const [cls] = await db.select().from(classes).where(eq(classes.id, id));
    return cls;
  }
  
  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.teacherId, teacherId));
  }
  
  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(classData).returning();
    return newClass;
  }
  
  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const [updatedClass] = await db
      .update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updatedClass;
  }
  
  async deleteClass(id: number): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id));
    return result.rowCount > 0;
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }
  
  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }
  
  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }
  
  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updatedStudent] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }
  
  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount > 0;
  }

  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments);
  }
  
  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment;
  }
  
  async getAssignmentsByClass(classId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.classId, classId));
  }
  
  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db.insert(assignments).values(assignmentData).returning();
    return assignment;
  }
  
  async updateAssignment(id: number, assignmentData: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set(assignmentData)
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }
  
  async deleteAssignment(id: number): Promise<boolean> {
    const result = await db.delete(assignments).where(eq(assignments.id, id));
    return result.rowCount > 0;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]> {
    const result = await db
      .select({
        id: tasks.id,
        assignmentId: tasks.assignmentId,
        studentId: tasks.studentId,
        completed: tasks.completed,
        completedAt: tasks.completedAt,
        assignment: assignments,
        class: classes,
      })
      .from(tasks)
      .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(tasks.studentId, studentId));
    
    return result as TaskWithAssignment[];
  }
  
  async getTasksByAssignment(assignmentId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignmentId, assignmentId));
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Curriculum operations
  async getCurriculums(): Promise<Curriculum[]> {
    return await db.select().from(curriculums);
  }
  
  async getCurriculum(id: number): Promise<Curriculum | undefined> {
    const [curriculum] = await db.select().from(curriculums).where(eq(curriculums.id, id));
    return curriculum;
  }
  
  async getCurriculumsByParent(parentId: string): Promise<Curriculum[]> {
    return await db.select().from(curriculums).where(eq(curriculums.parentId, parentId));
  }
  
  async createCurriculum(curriculumData: InsertCurriculum): Promise<Curriculum> {
    const [curriculum] = await db.insert(curriculums).values(curriculumData).returning();
    return curriculum;
  }
  
  async updateCurriculum(id: number, curriculumData: Partial<InsertCurriculum>): Promise<Curriculum | undefined> {
    const [updatedCurriculum] = await db
      .update(curriculums)
      .set(curriculumData)
      .where(eq(curriculums.id, id))
      .returning();
    return updatedCurriculum;
  }
  
  async deleteCurriculum(id: number): Promise<boolean> {
    const result = await db.delete(curriculums).where(eq(curriculums.id, id));
    return result.rowCount > 0;
  }

  // Curriculum lessons
  async getCurriculumLessons(curriculumId: number): Promise<CurriculumLesson[]> {
    return await db.select().from(curriculumLessons).where(eq(curriculumLessons.curriculumId, curriculumId));
  }
  
  async createCurriculumLesson(lessonData: InsertCurriculumLesson): Promise<CurriculumLesson> {
    const [lesson] = await db.insert(curriculumLessons).values(lessonData).returning();
    return lesson;
  }
  
  async updateCurriculumLesson(id: number, lessonData: Partial<InsertCurriculumLesson>): Promise<CurriculumLesson | undefined> {
    const [updatedLesson] = await db
      .update(curriculumLessons)
      .set(lessonData)
      .where(eq(curriculumLessons.id, id))
      .returning();
    return updatedLesson;
  }

  // Student curriculum assignments
  async getStudentCurriculums(studentId: number): Promise<StudentCurriculum[]> {
    return await db.select().from(studentCurriculums).where(eq(studentCurriculums.studentId, studentId));
  }
  
  async createStudentCurriculum(data: InsertStudentCurriculum): Promise<StudentCurriculum> {
    const [studentCurriculum] = await db.insert(studentCurriculums).values(data).returning();
    return studentCurriculum;
  }
  
  async updateStudentCurriculum(id: number, data: Partial<InsertStudentCurriculum>): Promise<StudentCurriculum | undefined> {
    const [updated] = await db
      .update(studentCurriculums)
      .set(data)
      .where(eq(studentCurriculums.id, id))
      .returning();
    return updated;
  }

  // Lesson progress tracking
  async getLessonProgress(studentId: number, curriculumId: number): Promise<LessonProgress[]> {
    return await db
      .select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.studentId, studentId),
        eq(lessonProgress.curriculumId, curriculumId)
      ));
  }
  
  async createLessonProgress(progressData: InsertLessonProgress): Promise<LessonProgress> {
    const [progress] = await db.insert(lessonProgress).values(progressData).returning();
    return progress;
  }
  
  async updateLessonProgress(id: number, data: Partial<InsertLessonProgress>): Promise<LessonProgress | undefined> {
    const [updated] = await db
      .update(lessonProgress)
      .set(data)
      .where(eq(lessonProgress.id, id))
      .returning();
    return updated;
  }

  // Dashboard and reporting operations
  async getClassesWithStudentCount(teacherId: string): Promise<ClassWithStudentCount[]> {
    // This would require more complex SQL with joins and counts
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    return teacherClasses.map(cls => ({
      ...cls,
      studentCount: 0 // TODO: implement proper count
    }));
  }
  
  async getStudentProgress(teacherId: string): Promise<StudentProgress[]> {
    // This would require complex SQL with joins across multiple tables
    return [];
  }
  
  async getTaskCompletionRate(teacherId: string): Promise<number> {
    // This would require SQL aggregation
    return 0;
  }
}

export const storage = new DatabaseStorage();