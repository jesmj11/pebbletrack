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
  res.redirect('/student-view');
});

// Serve static HTML files directly
const routeMap = {
  '/student-view': 'static-student.html',
  '/parent-view': 'static-parent.html', 
  '/dashboard': 'static-dashboard.html',
  '/planner': 'static-planner.html',
  '/login': 'static-login.html'
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
const demoStudents = [
  { id: 1, parentId: 'demo-parent', fullName: 'Emma Johnson', gradeLevel: '6th Grade' },
  { id: 2, parentId: 'demo-parent', fullName: 'Jake Johnson', gradeLevel: '4th Grade' },
  { id: 3, parentId: 'demo-parent', fullName: 'Sophie Johnson', gradeLevel: '8th Grade' }
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Fallback for any other routes
app.get('*', (req, res) => {
  res.redirect('/student-view');
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