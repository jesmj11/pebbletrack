#!/usr/bin/env node

// Simple production startup script for Railway
// Set demo mode to avoid warnings
process.env.DEMO_MODE = 'true';
process.env.NODE_ENV = 'production';

import { createServer } from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check for Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'demo',
    env: 'production'
  });
});

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/static-dashboard');
});

// Serve static HTML files directly
const routeMap = {
  // Main demo routes
  '/student-view': 'static-student.html',
  '/parent-view': 'static-parent.html',
  
  // Routes that match the navigation links in HTML files
  '/static-dashboard': 'static-dashboard.html',
  '/static-planner': 'static-planner.html', 
  '/static-student': 'static-student.html',
  '/static-parent': 'static-parent.html',
  '/login': 'static-login.html',
  
  // Friendly aliases
  '/dashboard': 'static-dashboard.html',
  '/planner': 'static-planner.html',

  // BedrockELA Village Dashboard
  '/student-dashboard': 'student-dashboard.html',
  '/village': 'student-dashboard.html'
};

Object.entries(routeMap).forEach(([route, filename]) => {
  app.get(route, async (req, res) => {
    try {
      const filePath = path.join(__dirname, filename);
      if (fs.existsSync(filePath)) {
        const html = fs.readFileSync(filePath, 'utf8');
        res.send(html);
      } else {
        res.status(404).send(`Page not found: ${filename}`);
      }
    } catch (error) {
      console.error(`Error serving ${filename}:`, error);
      res.status(500).send('Error loading page');
    }
  });
});

// Simple API endpoints with demo data
let demoStudents = [
  { id: 1, parentId: 'demo-parent', fullName: 'Emma Johnson', gradeLevel: '6th Grade', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, parentId: 'demo-parent', fullName: 'Jake Johnson', gradeLevel: '4th Grade', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, parentId: 'demo-parent', fullName: 'Sophie Johnson', gradeLevel: '8th Grade', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

let demoTasks = [
  {
    id: '1',
    title: 'Math Worksheet - Fractions',
    subject: 'Mathematics',
    description: 'Complete pages 12-15',
    completed: false,
    studentId: 1,
    dueDate: new Date().toISOString()
  },
  {
    id: '2', 
    title: 'Science Reading',
    subject: 'Science',
    description: 'Chapter 3: Plants and Animals',
    completed: false,
    studentId: 1,
    dueDate: new Date().toISOString()
  },
  {
    id: '3',
    title: 'History Report', 
    subject: 'History',
    description: 'Write about the Civil War',
    completed: true,
    studentId: 2,
    dueDate: new Date().toISOString()
  }
];

// Demo curriculum data
let demoCurriculums = [
  {
    id: 1,
    parentId: 'demo-parent',
    name: 'Saxon Math 7/6',
    subject: 'Mathematics', 
    gradeLevel: '6th-7th Grade',
    publisher: 'Saxon Publishers',
    description: 'Comprehensive math curriculum covering pre-algebra concepts',
    totalLessons: 140,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    parentId: 'demo-parent',
    name: 'Apologia General Science',
    subject: 'Science',
    gradeLevel: '7th-9th Grade', 
    publisher: 'Apologia',
    description: 'Creation-based general science textbook covering chemistry, physics, and earth science',
    totalLessons: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let demoCurriculumLessons = [
  // Saxon Math lessons
  { id: 1, curriculumId: 1, lessonNumber: 1, title: 'Whole Numbers', type: 'lesson', description: 'Introduction to whole numbers', estimatedMinutes: 45 },
  { id: 2, curriculumId: 1, lessonNumber: 2, title: 'Place Value', type: 'lesson', description: 'Understanding place value concepts', estimatedMinutes: 30 },
  { id: 3, curriculumId: 1, lessonNumber: 3, title: 'Addition of Whole Numbers', type: 'lesson', description: 'Adding whole numbers', estimatedMinutes: 40 },
  
  // Apologia Science lessons  
  { id: 4, curriculumId: 2, lessonNumber: 1, title: 'The History of Science', type: 'lesson', description: 'Overview of scientific method and history', estimatedMinutes: 60 },
  { id: 5, curriculumId: 2, lessonNumber: 2, title: 'The Scientific Method', type: 'lesson', description: 'Learning to think like a scientist', estimatedMinutes: 50 }
];

// API endpoints
app.get('/api/planner/students', (req, res) => {
  res.json(demoStudents);
});

app.get('/api/planner/classes', (req, res) => {
  res.json(demoTasks);
});

app.patch('/api/planner/classes/:id', (req, res) => {
  const taskId = req.params.id;
  const { completed, completedAt } = req.body;
  
  const task = demoTasks.find(t => t.id === taskId);
  if (task) {
    task.completed = completed;
    if (completedAt) task.completedAt = completedAt;
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Student Management API Endpoints
app.post('/api/planner/students', (req, res) => {
  try {
    const { fullName, gradeLevel } = req.body;
    
    if (!fullName || !gradeLevel) {
      return res.status(400).json({ error: 'Full name and grade level are required' });
    }
    
    const newId = Math.max(...demoStudents.map(s => s.id), 0) + 1;
    const newStudent = {
      id: newId,
      parentId: 'demo-parent',
      fullName: fullName.trim(),
      gradeLevel: gradeLevel.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    demoStudents.push(newStudent);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.delete('/api/planner/students/:id', (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    console.log('Delete request for student ID:', studentId, 'Type:', typeof studentId);
    console.log('Current students:', demoStudents.map(s => ({ id: s.id, name: s.fullName, type: typeof s.id })));
    
    const studentIndex = demoStudents.findIndex(s => s.id === studentId);
    console.log('Found student index:', studentIndex);
    
    if (studentIndex === -1) {
      console.log('Student not found with ID:', studentId);
      return res.status(404).json({ 
        error: 'Student not found',
        requestedId: studentId,
        availableStudents: demoStudents.map(s => ({ id: s.id, name: s.fullName }))
      });
    }
    
    // Remove the student
    const deletedStudent = demoStudents.splice(studentIndex, 1)[0];
    console.log('Deleted student:', deletedStudent);
    
    // Remove all tasks associated with this student
    const tasksBeforeDelete = demoTasks.length;
    demoTasks = demoTasks.filter(task => task.studentId !== studentId);
    const tasksAfterDelete = demoTasks.length;
    console.log(`Removed ${tasksBeforeDelete - tasksAfterDelete} tasks for student ${studentId}`);
    
    res.json({ 
      message: 'Student deleted successfully', 
      student: deletedStudent,
      tasksRemoved: tasksBeforeDelete - tasksAfterDelete
    });
  } catch (error) {
    console.error('Error in delete endpoint:', error);
    res.status(500).json({ error: 'Failed to delete student', details: error.message });
  }
});

app.patch('/api/planner/students/:id', (req, res) => {
  try {
    const studentId = parseInt(req.params.id);
    const { fullName, gradeLevel } = req.body;
    
    const student = demoStudents.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Update student fields
    if (fullName !== undefined) student.fullName = fullName.trim();
    if (gradeLevel !== undefined) student.gradeLevel = gradeLevel.trim();
    student.updatedAt = new Date().toISOString();
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Additional endpoints for full compatibility
app.post('/api/planner/classes', (req, res) => {
  try {
    const { title, subject, description = '', studentId, dueDate } = req.body;
    
    if (!title || !subject) {
      return res.status(400).json({ error: 'Title and subject are required' });
    }
    
    const newId = (Math.max(...demoTasks.map(t => parseInt(t.id) || 0), 0) + 1).toString();
    const newTask = {
      id: newId,
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      completed: false,
      studentId: studentId ? parseInt(studentId) : null,
      dueDate: dueDate || new Date().toISOString(),
      day: 'monday',
      studentIndex: 0,
      weekKey: new Date().toISOString().split('T')[0]
    };
    
    demoTasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.delete('/api/planner/classes/:id', (req, res) => {
  try {
    const taskId = req.params.id;
    
    const taskIndex = demoTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const deletedTask = demoTasks.splice(taskIndex, 1)[0];
    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Curriculum Management API Endpoints
app.get('/api/curriculums', (req, res) => {
  try {
    res.json(demoCurriculums);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch curriculums' });
  }
});

app.post('/api/curriculums', (req, res) => {
  try {
    const { name, subject, gradeLevel, publisher, description } = req.body;
    
    if (!name || !subject) {
      return res.status(400).json({ error: 'Name and subject are required' });
    }
    
    const newId = Math.max(...demoCurriculums.map(c => c.id), 0) + 1;
    const newCurriculum = {
      id: newId,
      parentId: 'demo-parent',
      name: name.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel?.trim() || '',
      publisher: publisher?.trim() || '',
      description: description?.trim() || '',
      totalLessons: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    demoCurriculums.push(newCurriculum);
    res.status(201).json(newCurriculum);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create curriculum' });
  }
});

app.get('/api/curriculums/:id/lessons', (req, res) => {
  try {
    const curriculumId = parseInt(req.params.id);
    const lessons = demoCurriculumLessons.filter(l => l.curriculumId === curriculumId);
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

app.post('/api/curriculums/:id/lessons', (req, res) => {
  try {
    const curriculumId = parseInt(req.params.id);
    const { lessons } = req.body;
    
    if (!Array.isArray(lessons)) {
      return res.status(400).json({ error: 'Lessons must be an array' });
    }
    
    const newLessons = lessons.map((lesson, index) => {
      const newId = Math.max(...demoCurriculumLessons.map(l => l.id), 0) + index + 1;
      return {
        id: newId,
        curriculumId,
        lessonNumber: lesson.lessonNumber || (index + 1),
        title: lesson.title || `Lesson ${index + 1}`,
        type: lesson.type || 'lesson',
        description: lesson.description || '',
        estimatedMinutes: lesson.estimatedMinutes || 30
      };
    });
    
    demoCurriculumLessons.push(...newLessons);
    
    // Update curriculum total lessons
    const curriculum = demoCurriculums.find(c => c.id === curriculumId);
    if (curriculum) {
      curriculum.totalLessons = demoCurriculumLessons.filter(l => l.curriculumId === curriculumId).length;
      curriculum.updatedAt = new Date().toISOString();
    }
    
    res.status(201).json(newLessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lessons' });
  }
});

// AI Curriculum Analysis endpoint (mock implementation)
app.post('/api/curriculum/analyze', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    
    // Mock AI analysis - return sample lessons
    const mockLessons = [
      {
        lessonNumber: 1,
        title: 'Introduction to Fractions',
        type: 'lesson',
        description: 'Learn the basics of fractions and their representation',
        estimatedMinutes: 35
      },
      {
        lessonNumber: 2, 
        title: 'Adding Fractions',
        type: 'lesson',
        description: 'Practice adding fractions with like and unlike denominators',
        estimatedMinutes: 40
      },
      {
        lessonNumber: 3,
        title: 'Fraction Quiz',
        type: 'quiz',
        description: 'Test your understanding of basic fractions',
        estimatedMinutes: 20
      },
      {
        lessonNumber: 4,
        title: 'Subtracting Fractions',
        type: 'lesson', 
        description: 'Learn to subtract fractions with different denominators',
        estimatedMinutes: 45
      },
      {
        lessonNumber: 5,
        title: 'Mixed Numbers',
        type: 'lesson',
        description: 'Converting between improper fractions and mixed numbers',
        estimatedMinutes: 30
      }
    ];
    
    // Simulate AI processing time
    setTimeout(() => {
      res.json({ lessons: mockLessons });
    }, 2000);
    
  } catch (error) {
    console.error('Error in mock curriculum analysis:', error);
    res.status(500).json({ error: 'Failed to analyze curriculum image' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Fallback for any other routes
app.get('*', (req, res) => {
  res.redirect('/static-dashboard');
});

// Start server
const port = parseInt(process.env.PORT || '5000');
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 PebbleTrack Demo running on port ${port}`);
  console.log(`📱 Student View: /student-view`);
  console.log(`📊 Parent View: /parent-view`);
  console.log(`💚 Health Check: /health`);
  console.log(`🎯 Demo Mode: ENABLED`);
  console.log(`🚀 Ready for Railway deployment!`);
});// Force rebuild Tue Feb  3 03:23:24 AM UTC 2026
