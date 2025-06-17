import { db } from "./db";
import { users, students, classes, assignments, tasks, curriculums, curriculumLessons, studentCurriculums, lessonProgress } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import type { 
  User, InsertUser, Student, InsertStudent, 
  Class, InsertClass, Assignment, InsertAssignment,
  Task, InsertTask, StudentWithUser, TaskWithAssignment,
  ClassWithStudentCount, StudentProgress, Curriculum, InsertCurriculum,
  CurriculumLesson, InsertCurriculumLesson, StudentCurriculum, InsertStudentCurriculum,
  LessonProgress, InsertLessonProgress, StudentDailyLessons
} from "@shared/schema";

export interface IAuthStorage {
  // Authentication operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  
  // Student operations for families
  getStudent(id: number): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  getStudentsByParent(parentId: number): Promise<Student[]>;
  createStudent(studentData: InsertStudent): Promise<Student>;
  updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  
  // Task operations for students
  getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Class and assignment operations for parents
  getClassesByParent(parentId: number): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  getAssignmentsByParent(parentId: number): Promise<Assignment[]>;
  createAssignment(assignmentData: InsertAssignment): Promise<Assignment>;
  
  // Dashboard data
  getParentDashboardData(parentId: number): Promise<{
    students: Student[];
    classes: ClassWithStudentCount[];
    totalTasks: number;
    completedTasks: number;
  }>;

  // Curriculum management operations
  getCurriculumsByParent(parentId: number): Promise<Curriculum[]>;
  createCurriculum(curriculumData: InsertCurriculum): Promise<Curriculum>;
  bulkCreateLessons(curriculumId: number, lessons: InsertCurriculumLesson[]): Promise<CurriculumLesson[]>;
  updateCurriculumTotalLessons(curriculumId: number, totalLessons: number): Promise<void>;
  getLessonsByCurriculum(curriculumId: number): Promise<CurriculumLesson[]>;
  assignCurriculumToStudent(assignment: InsertStudentCurriculum): Promise<StudentCurriculum>;
  getStudentDailyLessons(studentId: number): Promise<StudentDailyLessons>;
  updateLessonProgress(lessonId: number, progressData: Partial<InsertLessonProgress>): Promise<LessonProgress>;
}

export class AuthStorage implements IAuthStorage {
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        role: "parent",
      })
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudentsByParent(parentId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.parentId, parentId));
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(studentData)
      .returning();
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]> {
    const tasksData = await db
      .select({
        task: tasks,
        assignment: assignments,
        class: classes,
      })
      .from(tasks)
      .leftJoin(assignments, eq(tasks.assignmentId, assignments.id))
      .leftJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(tasks.studentId, studentId));

    return tasksData.map(row => ({
      ...row.task,
      assignment: row.assignment!,
      class: row.class!,
    }));
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async getClassesByParent(parentId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.teacherId, parentId));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [newClass] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return newClass;
  }

  async getAssignmentsByParent(parentId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.createdBy, parentId));
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db
      .insert(assignments)
      .values(assignmentData)
      .returning();
    return assignment;
  }

  async getParentDashboardData(parentId: number): Promise<{
    students: Student[];
    classes: ClassWithStudentCount[];
    totalTasks: number;
    completedTasks: number;
  }> {
    const [studentsData, classesData, tasksData] = await Promise.all([
      this.getStudentsByParent(parentId),
      this.getClassesByParent(parentId),
      db.select().from(tasks)
        .leftJoin(students, eq(tasks.studentId, students.id))
        .where(eq(students.parentId, parentId))
    ]);

    const classesWithCount = classesData.map(cls => ({
      ...cls,
      studentCount: studentsData.filter(s => 
        // For now, count all students for each class
        true
      ).length
    }));

    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.tasks?.completed).length;

    return {
      students: studentsData,
      classes: classesWithCount,
      totalTasks,
      completedTasks,
    };
  }

  // Curriculum management methods
  async getCurriculumsByParent(parentId: number): Promise<Curriculum[]> {
    return await db.select().from(curriculums).where(eq(curriculums.parentId, parentId));
  }

  async createCurriculum(curriculumData: InsertCurriculum): Promise<Curriculum> {
    const [curriculum] = await db.insert(curriculums).values(curriculumData).returning();
    return curriculum;
  }

  async bulkCreateLessons(curriculumId: number, lessons: InsertCurriculumLesson[]): Promise<CurriculumLesson[]> {
    const lessonsWithCurriculumId = lessons.map(lesson => ({
      ...lesson,
      curriculumId
    }));
    return await db.insert(curriculumLessons).values(lessonsWithCurriculumId).returning();
  }

  async updateCurriculumTotalLessons(curriculumId: number, totalLessons: number): Promise<void> {
    await db.update(curriculums)
      .set({ totalLessons })
      .where(eq(curriculums.id, curriculumId));
  }

  async getLessonsByCurriculum(curriculumId: number): Promise<CurriculumLesson[]> {
    return await db.select().from(curriculumLessons)
      .where(eq(curriculumLessons.curriculumId, curriculumId))
      .orderBy(curriculumLessons.lessonNumber);
  }

  async assignCurriculumToStudent(assignment: InsertStudentCurriculum): Promise<StudentCurriculum> {
    const [studentCurriculum] = await db.insert(studentCurriculums).values(assignment).returning();
    return studentCurriculum;
  }

  async getStudentDailyLessons(studentId: number): Promise<StudentDailyLessons> {
    // Get student's active curriculums
    const studentCurriculumData = await db.select({
      curriculum: curriculums,
      studentCurriculum: studentCurriculums
    })
    .from(studentCurriculums)
    .innerJoin(curriculums, eq(studentCurriculums.curriculumId, curriculums.id))
    .where(and(
      eq(studentCurriculums.studentId, studentId),
      eq(studentCurriculums.isActive, true)
    ));

    const student = await this.getStudent(studentId);
    if (!student) throw new Error("Student not found");

    const curriculumsWithLessons = await Promise.all(
      studentCurriculumData.map(async ({ curriculum, studentCurriculum }) => {
        // Get today's lessons based on current lesson and lessons per day
        const allLessons = await this.getLessonsByCurriculum(curriculum.id);
        const currentLessonIndex = studentCurriculum.currentLesson - 1;
        const todaysLessons = allLessons.slice(
          currentLessonIndex,
          currentLessonIndex + studentCurriculum.lessonsPerDay
        );

        return {
          id: curriculum.id,
          name: curriculum.name,
          subject: curriculum.subject,
          todaysLessons,
          lessonsPerDay: studentCurriculum.lessonsPerDay,
          progress: Math.round((studentCurriculum.currentLesson / curriculum.totalLessons) * 100)
        };
      })
    );

    return {
      studentId: student.id,
      studentName: student.fullName,
      curriculums: curriculumsWithLessons
    };
  }

  async updateLessonProgress(lessonId: number, progressData: Partial<InsertLessonProgress>): Promise<LessonProgress> {
    // First, try to find existing progress record
    const existingProgress = await db.select().from(lessonProgress)
      .where(eq(lessonProgress.lessonId, lessonId))
      .limit(1);

    if (existingProgress.length > 0) {
      // Update existing record
      const [updated] = await db.update(lessonProgress)
        .set(progressData)
        .where(eq(lessonProgress.id, existingProgress[0].id))
        .returning();
      return updated;
    } else {
      // Create new progress record
      const [created] = await db.insert(lessonProgress)
        .values(progressData as InsertLessonProgress)
        .returning();
      return created;
    }
  }
}

export const authStorage = new AuthStorage();