import {
  users, classes, students, assignments, tasks,
  type User, type InsertUser,
  type Class, type InsertClass,
  type Student, type InsertStudent,
  type Assignment, type InsertAssignment, 
  type Task, type InsertTask,
  type StudentWithUser, type TaskWithAssignment,
  type ClassWithStudentCount, type StudentProgress
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Class operations
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  getClassesByTeacher(teacherId: number): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined>;
  deleteClass(id: number): Promise<boolean>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentsByClass(classId: number): Promise<StudentWithUser[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;
  getStudentsWithUserData(): Promise<StudentWithUser[]>;
  
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
  
  // Dashboard and reporting operations
  getClassesWithStudentCount(teacherId: number): Promise<ClassWithStudentCount[]>;
  getStudentProgress(teacherId: number): Promise<StudentProgress[]>;
  getTaskCompletionRate(teacherId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private classes: Map<number, Class>;
  private students: Map<number, Student>;
  private assignments: Map<number, Assignment>;
  private tasks: Map<number, Task>;
  
  private userId: number;
  private classId: number;
  private studentId: number;
  private assignmentId: number;
  private taskId: number;
  
  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.students = new Map();
    this.assignments = new Map();
    this.tasks = new Map();
    
    this.userId = 1;
    this.classId = 1;
    this.studentId = 1;
    this.assignmentId = 1;
    this.taskId = 1;
    
    // Initialize with default teacher
    this.createUser({
      username: "teacher",
      password: "password",
      role: "teacher",
      fullName: "Ms. Johnson"
    });
  }
  
  // User operations
  async getUsers(): Promise<User[]> {
    return [...this.users.values()];
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return [...this.users.values()].find(user => user.username === username);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const user = { ...userData, id };
    this.users.set(id, user);
    return user;
  }
  
  // Class operations
  async getClasses(): Promise<Class[]> {
    return [...this.classes.values()];
  }
  
  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }
  
  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    return [...this.classes.values()].filter(cls => cls.teacherId === teacherId);
  }
  
  async createClass(classData: InsertClass): Promise<Class> {
    const id = this.classId++;
    const newClass = { ...classData, id };
    this.classes.set(id, newClass);
    return newClass;
  }
  
  async updateClass(id: number, classData: Partial<InsertClass>): Promise<Class | undefined> {
    const existingClass = this.classes.get(id);
    if (!existingClass) return undefined;
    
    const updatedClass = { ...existingClass, ...classData };
    this.classes.set(id, updatedClass);
    return updatedClass;
  }
  
  async deleteClass(id: number): Promise<boolean> {
    return this.classes.delete(id);
  }
  
  // Student operations
  async getStudents(): Promise<Student[]> {
    return [...this.students.values()];
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async getStudentsByClass(classId: number): Promise<StudentWithUser[]> {
    const studentsWithUser: StudentWithUser[] = [];
    
    for (const student of this.students.values()) {
      if (student.classIds.includes(classId.toString())) {
        const user = this.users.get(student.userId);
        if (user) {
          studentsWithUser.push({ ...student, user });
        }
      }
    }
    
    return studentsWithUser;
  }
  
  async createStudent(studentData: InsertStudent): Promise<Student> {
    const id = this.studentId++;
    const student = { ...studentData, id };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const existingStudent = this.students.get(id);
    if (!existingStudent) return undefined;
    
    const updatedStudent = { ...existingStudent, ...studentData };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  
  async deleteStudent(id: number): Promise<boolean> {
    return this.students.delete(id);
  }
  
  async getStudentsWithUserData(): Promise<StudentWithUser[]> {
    const studentsWithUser: StudentWithUser[] = [];
    
    for (const student of this.students.values()) {
      const user = this.users.get(student.userId);
      if (user) {
        studentsWithUser.push({ ...student, user });
      }
    }
    
    return studentsWithUser;
  }
  
  // Assignment operations
  async getAssignments(): Promise<Assignment[]> {
    return [...this.assignments.values()];
  }
  
  async getAssignment(id: number): Promise<Assignment | undefined> {
    return this.assignments.get(id);
  }
  
  async getAssignmentsByClass(classId: number): Promise<Assignment[]> {
    return [...this.assignments.values()].filter(assignment => assignment.classId === classId);
  }
  
  async createAssignment(assignmentData: InsertAssignment): Promise<Assignment> {
    const id = this.assignmentId++;
    const assignment = { ...assignmentData, id };
    this.assignments.set(id, assignment);
    
    // Create tasks for all students in the class
    const studentsInClass = await this.getStudentsByClass(assignmentData.classId);
    for (const student of studentsInClass) {
      await this.createTask({
        assignmentId: id,
        studentId: student.id,
        completed: false,
        completedAt: null
      });
    }
    
    return assignment;
  }
  
  async updateAssignment(id: number, assignmentData: Partial<InsertAssignment>): Promise<Assignment | undefined> {
    const existingAssignment = this.assignments.get(id);
    if (!existingAssignment) return undefined;
    
    const updatedAssignment = { ...existingAssignment, ...assignmentData };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }
  
  async deleteAssignment(id: number): Promise<boolean> {
    // Delete associated tasks
    for (const task of this.tasks.values()) {
      if (task.assignmentId === id) {
        this.tasks.delete(task.id);
      }
    }
    
    return this.assignments.delete(id);
  }
  
  // Task operations
  async getTasks(): Promise<Task[]> {
    return [...this.tasks.values()];
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTasksByStudent(studentId: number): Promise<TaskWithAssignment[]> {
    const tasksWithAssignment: TaskWithAssignment[] = [];
    
    for (const task of this.tasks.values()) {
      if (task.studentId === studentId) {
        const assignment = this.assignments.get(task.assignmentId);
        if (assignment) {
          const cls = this.classes.get(assignment.classId);
          if (cls) {
            tasksWithAssignment.push({
              ...task,
              assignment,
              class: cls
            });
          }
        }
      }
    }
    
    return tasksWithAssignment;
  }
  
  async getTasksByAssignment(assignmentId: number): Promise<Task[]> {
    return [...this.tasks.values()].filter(task => task.assignmentId === assignmentId);
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const task = { ...taskData, id };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Dashboard and reporting operations
  async getClassesWithStudentCount(teacherId: number): Promise<ClassWithStudentCount[]> {
    const classesWithCount: ClassWithStudentCount[] = [];
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    
    for (const cls of teacherClasses) {
      const students = await this.getStudentsByClass(cls.id);
      classesWithCount.push({
        ...cls,
        studentCount: students.length
      });
    }
    
    return classesWithCount;
  }
  
  async getStudentProgress(teacherId: number): Promise<StudentProgress[]> {
    const progress: StudentProgress[] = [];
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    
    for (const cls of teacherClasses) {
      const students = await this.getStudentsByClass(cls.id);
      
      for (const student of students) {
        const tasks = await this.getTasksByStudent(student.id);
        const completedTasks = tasks.filter(task => task.completed).length;
        const pendingTasks = tasks.length - completedTasks;
        const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
        
        progress.push({
          studentId: student.id,
          fullName: student.user.fullName,
          className: cls.name,
          completedTasks,
          pendingTasks,
          progressPercentage
        });
      }
    }
    
    return progress;
  }
  
  async getTaskCompletionRate(teacherId: number): Promise<number> {
    const teacherClasses = await this.getClassesByTeacher(teacherId);
    let totalTasks = 0;
    let completedTasks = 0;
    
    for (const cls of teacherClasses) {
      const assignments = await this.getAssignmentsByClass(cls.id);
      
      for (const assignment of assignments) {
        const tasks = await this.getTasksByAssignment(assignment.id);
        totalTasks += tasks.length;
        completedTasks += tasks.filter(task => task.completed).length;
      }
    }
    
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }
}

export const storage = new MemStorage();
