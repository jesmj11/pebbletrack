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
  '/planner': 'static-planner.html'
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
    
    const studentIndex = demoStudents.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Remove the student
    const deletedStudent = demoStudents.splice(studentIndex, 1)[0];
    
    // Remove all tasks associated with this student
    demoTasks = demoTasks.filter(task => task.studentId !== studentId);
    
    res.json({ message: 'Student deleted successfully', student: deletedStudent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
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
});