import {
  users,
  sessions,
  students,
  classes,
  assignments,
  tasks,
  plannerTasks,
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
  type PlannerTask,
  type InsertPlannerTask,
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

  // Planner task operations (simplified)
  getAllTasks(): Promise<PlannerTask[]>;
  getPlannerTask(id: string): Promise<PlannerTask | undefined>;
  createPlannerTask(task: InsertPlannerTask): Promise<PlannerTask>;
  updatePlannerTask(id: string, taskData: Partial<InsertPlannerTask>): Promise<PlannerTask | undefined>;
  deletePlannerTask(id: string): Promise<boolean>;
  
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

  // Planner task operations (simplified)
  async getAllTasks(): Promise<PlannerTask[]> {
    return await db.select().from(plannerTasks);
  }

  async getPlannerTask(id: string): Promise<PlannerTask | undefined> {
    const [task] = await db.select().from(plannerTasks).where(eq(plannerTasks.id, id));
    return task;
  }

  async createPlannerTask(taskData: InsertPlannerTask): Promise<PlannerTask> {
    const taskWithId = {
      ...taskData,
      id: Date.now().toString(),
    };
    const [task] = await db.insert(plannerTasks).values(taskWithId).returning();
    return task;
  }

  async updatePlannerTask(id: string, taskData: Partial<InsertPlannerTask>): Promise<PlannerTask | undefined> {
    const [updatedTask] = await db
      .update(plannerTasks)
      .set(taskData)
      .where(eq(plannerTasks.id, id))
      .returning();
    return updatedTask;
  }

  async deletePlannerTask(id: string): Promise<boolean> {
    const [deletedTask] = await db
      .delete(plannerTasks)
      .where(eq(plannerTasks.id, id))
      .returning();
    return !!deletedTask;
  }
}

// Demo storage class for when database is not available
class DemoStorage implements IStorage {
  private students: Student[] = [
    { id: 1, parentId: 'demo-parent', fullName: 'Emma Johnson', gradeLevel: '6th Grade', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, parentId: 'demo-parent', fullName: 'Jake Johnson', gradeLevel: '4th Grade', createdAt: new Date(), updatedAt: new Date() },
    { id: 3, parentId: 'demo-parent', fullName: 'Sophie Johnson', gradeLevel: '8th Grade', createdAt: new Date(), updatedAt: new Date() }
  ];

  private plannerTasks: PlannerTask[] = [
    {
      id: '1',
      title: 'Math Worksheet - Fractions',
      subject: 'Mathematics',
      description: 'Complete pages 12-15',
      day: 'monday',
      studentIndex: 0,
      weekKey: '2025-01-27',
      completed: false,
      studentId: 1,
      dueDate: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Science Reading',
      subject: 'Science',
      description: 'Chapter 3: Plants and Animals',
      day: 'monday',
      studentIndex: 0,
      weekKey: '2025-01-27',
      completed: false,
      studentId: 1,
      dueDate: new Date().toISOString()
    },
    {
      id: '3',
      title: 'History Report',
      subject: 'History',
      description: 'Write about the Civil War',
      day: 'tuesday',
      studentIndex: 1,
      weekKey: '2025-01-27',
      completed: true,
      studentId: 2,
      dueDate: new Date().toISOString()
    }
  ];

  // Basic implementations for demo
  async getUser(id: string): Promise<User | undefined> {
    return undefined; // Not needed for demo
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    throw new Error('Not implemented in demo mode');
  }

  async getClasses(): Promise<Class[]> {
    return [];
  }

  async getClass(id: number): Promise<Class | undefined> {
    return undefined;
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return [];
  }

  async createClass(classData: InsertClass): Promise<Class> {
    throw new Error('Not implemented in demo mode');
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    return undefined;
  }

  async deleteClass(id: number): Promise<boolean> {
    return false;
  }

  async getStudents(): Promise<Student[]> {
    return [...this.students];
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.find(s => s.id === id);
  }

  async getStudentsByParent(parentId: string): Promise<Student[]> {
    return this.students.filter(s => s.parentId === parentId);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const newStudent: Student = {
      id: this.students.length + 1,
      ...student,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.students.push(newStudent);
    return newStudent;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const studentIndex = this.students.findIndex(s => s.id === id);
    if (studentIndex >= 0) {
      this.students[studentIndex] = { ...this.students[studentIndex], ...studentData, updatedAt: new Date() };
      return this.students[studentIndex];
    }
    return undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const originalLength = this.students.length;
    this.students = this.students.filter(s => s.id !== id);
    return this.students.length < originalLength;
  }

  async getAssignments(): Promise<Assignment[]> {
    return [];
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    return undefined;
  }

  async getAssignmentsByClass(classId: number): Promise<Assignment[]> {
    return [];
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    throw new Error('Not implemented in demo mode');
  }

  async updateAssignment(id: number, assignmentData: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    return undefined;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    return false;
  }

  async getTasks(): Promise<Task[]> {
    return [];
  }

  async getTask(id: number): Promise<Task | undefined> {
    return undefined;
  }

  async getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]> {
    return [];
  }

  async getTasksByAssignment(assignmentId: number): Promise<Task[]> {
    return [];
  }

  async createTask(task: InsertTask): Promise<Task> {
    throw new Error('Not implemented in demo mode');
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    return undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    return false;
  }

  // Planner task operations (main demo functionality)
  async getAllTasks(): Promise<PlannerTask[]> {
    return [...this.plannerTasks];
  }

  async getPlannerTask(id: string): Promise<PlannerTask | undefined> {
    return this.plannerTasks.find(t => t.id === id);
  }

  async createPlannerTask(taskData: InsertPlannerTask): Promise<PlannerTask> {
    const newTask: PlannerTask = {
      id: (this.plannerTasks.length + 1).toString(),
      ...taskData
    };
    this.plannerTasks.push(newTask);
    return newTask;
  }

  async updatePlannerTask(id: string, taskData: Partial<InsertPlannerTask>): Promise<PlannerTask | undefined> {
    const taskIndex = this.plannerTasks.findIndex(t => t.id === id);
    if (taskIndex >= 0) {
      this.plannerTasks[taskIndex] = { ...this.plannerTasks[taskIndex], ...taskData };
      return this.plannerTasks[taskIndex];
    }
    return undefined;
  }

  async deletePlannerTask(id: string): Promise<boolean> {
    const originalLength = this.plannerTasks.length;
    this.plannerTasks = this.plannerTasks.filter(t => t.id !== id);
    return this.plannerTasks.length < originalLength;
  }

  // Curriculum operations (minimal implementation)
  async getCurriculums(): Promise<Curriculum[]> {
    return [];
  }

  async getCurriculum(id: number): Promise<Curriculum | undefined> {
    return undefined;
  }

  async getCurriculumsByParent(parentId: string): Promise<Curriculum[]> {
    return [];
  }

  async createCurriculum(curriculum: InsertCurriculum): Promise<Curriculum> {
    throw new Error('Not implemented in demo mode');
  }

  async updateCurriculum(id: number, curriculumData: Partial<InsertCurriculum>): Promise<Curriculum | undefined> {
    return undefined;
  }

  async deleteCurriculum(id: number): Promise<boolean> {
    return false;
  }

  async getCurriculumLessons(curriculumId: number): Promise<CurriculumLesson[]> {
    return [];
  }

  async createCurriculumLesson(lesson: InsertCurriculumLesson): Promise<CurriculumLesson> {
    throw new Error('Not implemented in demo mode');
  }

  async updateCurriculumLesson(id: number, lessonData: Partial<InsertCurriculumLesson>): Promise<CurriculumLesson | undefined> {
    return undefined;
  }

  async getStudentCurriculums(studentId: number): Promise<StudentCurriculum[]> {
    return [];
  }

  async createStudentCurriculum(studentCurriculum: InsertStudentCurriculum): Promise<StudentCurriculum> {
    throw new Error('Not implemented in demo mode');
  }

  async updateStudentCurriculum(id: number, data: Partial<InsertStudentCurriculum>): Promise<StudentCurriculum | undefined> {
    return undefined;
  }

  async getLessonProgress(studentId: number, curriculumId: number): Promise<LessonProgress[]> {
    return [];
  }

  async createLessonProgress(progress: InsertLessonProgress): Promise<LessonProgress> {
    throw new Error('Not implemented in demo mode');
  }

  async updateLessonProgress(id: number, data: Partial<InsertLessonProgress>): Promise<LessonProgress | undefined> {
    return undefined;
  }

  async getClassesWithStudentCount(teacherId: string): Promise<ClassWithStudentCount[]> {
    return [];
  }

  async getStudentProgress(teacherId: string): Promise<StudentProgress[]> {
    return [];
  }

  async getTaskCompletionRate(teacherId: string): Promise<number> {
    return 0.75; // 75% for demo
  }
}

// Use database storage if available, otherwise use demo storage
export const storage = db ? new DatabaseStorage() : new DemoStorage();