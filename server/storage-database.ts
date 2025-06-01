import { 
  users, classes, students, assignments, tasks,
  type User, type InsertUser, type Class, type InsertClass, 
  type Student, type InsertStudent, type Assignment, type InsertAssignment,
  type Task, type InsertTask, type StudentWithUser, type TaskWithAssignment,
  type ClassWithStudentCount, type StudentProgress
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  
  // User operations
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Class operations
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClass(id: number): Promise<Class | undefined> {
    const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
    return classItem || undefined;
  }

  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.teacherId, teacherId));
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const [classItem] = await db
      .insert(classes)
      .values(classData)
      .returning();
    return classItem;
  }

  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const [updated] = await db
      .update(classes)
      .set(classData)
      .where(eq(classes.id, id))
      .returning();
    return updated || undefined;
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
    return student || undefined;
  }

  async getStudentsByClass(classId: number): Promise<StudentWithUser[]> {
    const result = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.classIds, [classId.toString()]));
    
    return result.map(row => ({
      ...row.students,
      user: row.users
    }));
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(studentData)
      .returning();
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount > 0;
  }

  async getStudentsWithUserData(): Promise<StudentWithUser[]> {
    const result = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id));
    
    return result.map(row => ({
      ...row.students,
      user: row.users
    }));
  }

  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    return await db.select().from(assignments);
  }

  async getAssignment(id: number): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async getAssignmentsByClass(classId: number): Promise<Assignment[]> {
    return await db.select().from(assignments).where(eq(assignments.classId, classId));
  }

  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db
      .insert(assignments)
      .values(assignmentData)
      .returning();
    return assignment;
  }

  async updateAssignment(id: number, assignmentData: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const [updated] = await db
      .update(assignments)
      .set(assignmentData)
      .where(eq(assignments.id, id))
      .returning();
    return updated || undefined;
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
    return task || undefined;
  }

  async getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]> {
    const result = await db
      .select()
      .from(tasks)
      .innerJoin(assignments, eq(tasks.assignmentId, assignments.id))
      .innerJoin(classes, eq(assignments.classId, classes.id))
      .where(eq(tasks.studentId, studentId));
    
    return result.map(row => ({
      ...row.tasks,
      assignment: row.assignments,
      class: row.classes
    }));
  }

  async getTasksByAssignment(assignmentId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.assignmentId, assignmentId));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(taskData)
      .returning();
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Dashboard and reporting operations
  async getClassesWithStudentCount(teacherId: number): Promise<ClassWithStudentCount[]> {
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    
    const classesWithCount = await Promise.all(
      teacherClasses.map(async (classItem) => {
        const studentsInClass = await this.getStudentsByClass(classItem.id);
        return {
          ...classItem,
          studentCount: studentsInClass.length
        };
      })
    );
    
    return classesWithCount;
  }

  async getStudentProgress(teacherId: number): Promise<StudentProgress[]> {
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    const progress: StudentProgress[] = [];
    
    for (const classItem of teacherClasses) {
      const studentsInClass = await this.getStudentsByClass(classItem.id);
      
      for (const student of studentsInClass) {
        const studentTasks = await this.getTasksByStudent(student.id);
        const completedTasks = studentTasks.filter(task => task.completed).length;
        const pendingTasks = studentTasks.filter(task => !task.completed).length;
        const totalTasks = studentTasks.length;
        
        progress.push({
          studentId: student.id,
          fullName: student.user.fullName,
          className: classItem.name,
          completedTasks,
          pendingTasks,
          progressPercentage: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
        });
      }
    }
    
    return progress;
  }

  async getTaskCompletionRate(teacherId: number): Promise<number> {
    const progress = await this.getStudentProgress(teacherId);
    
    if (progress.length === 0) return 0;
    
    const totalTasks = progress.reduce((sum, p) => sum + p.completedTasks + p.pendingTasks, 0);
    const completedTasks = progress.reduce((sum, p) => sum + p.completedTasks, 0);
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }
}