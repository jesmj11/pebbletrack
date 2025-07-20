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
- 2025-01-20: **MAJOR**: Replaced local authentication system with Replit Auth
- 2025-01-20: Fixed login redirection issue by implementing proper Replit OpenID Connect flow
- 2025-01-20: Added Landing page with authentication flow and forgot password functionality
- 2025-01-20: Updated database schema to support text-based user IDs (Replit Auth requirement)
- 2025-01-20: Created comprehensive authentication infrastructure (useAuth hook, authUtils)

## Resolved Issues
- ✅ Login redirection loop fixed - now uses Replit Auth system
- ✅ Forgot password functionality added at /forgot-password route
- ✅ Database schema migrated to support Replit Auth (text IDs instead of integers)
- ✅ Authentication infrastructure completely rebuilt for reliability

## Current State
- Application successfully running with Replit Auth integration
- Landing page displays for unauthenticated users
- Login flow redirects to Replit's secure authentication
- Database properly configured with sessions table for auth persistence

## User Preferences
- Keep responses focused and technical when debugging
- Prioritize working authentication system