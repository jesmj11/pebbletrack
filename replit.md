# Homeschool Task Management Platform

## Overview
A comprehensive task management and e-learning platform optimized for homeschool environments, with an advanced teacher planner and dynamic student tracking system.

## Key Technologies
- PostgreSQL for persistent data storage
- TypeScript for robust type-checking
- Drizzle ORM for database interactions
- React frontend with Tailwind CSS
- Express.js backend with modular architecture
- Replit Auth for authentication
- Responsive design with dynamic UI components

## Features
- Customizable weekly planner with student-centric task management
- AI-powered lesson extraction from curriculum materials
- Student progress tracking and reporting
- Printable planner functionality
- Role-based access (parent/teacher and student views)

## Project Architecture
- Frontend: React with Wouter routing in `client/src/`
- Backend: Express.js server in `server/`
- Database: PostgreSQL with Drizzle ORM
- Authentication: Replit Auth with OpenID Connect
- Shared schema: `shared/schema.ts`

## Recent Changes
- 2025-01-20: Fixed compilation error in AILessonExtractor.tsx (duplicate typeColors declaration)
- 2025-01-20: Server successfully running on port 5000
- 2025-01-20: PostgreSQL database provisioned

## Current Issues
- Login redirects back to login screen after successful authentication
- Need to add forgot password functionality

## User Preferences
- Keep responses focused and technical when debugging
- Prioritize working authentication system