# Task Management & E-Learning Platform

## Overview
A comprehensive task management and e-learning platform optimized for homeschool environments, featuring:
- Advanced teacher planner with dynamic student tracking
- PostgreSQL database for persistent data storage
- TypeScript with Drizzle ORM for robust type-checking
- React frontend with Tailwind CSS
- Express.js backend with modular architecture
- Replit authentication integration
- Responsive design with customizable weekly planner
- Printable planner functionality

## Project Architecture

### Backend
- **Express.js** server with Replit authentication
- **PostgreSQL** database via Neon with Drizzle ORM
- **Storage Layer**: `server/storage-replit.ts` - PostgreSQL implementation
- **Authentication**: Replit OAuth with session management
- **API Routes**: RESTful endpoints for all CRUD operations

### Frontend
- **React** with TypeScript
- **TanStack Query** for data fetching and caching
- **Wouter** for client-side routing
- **Tailwind CSS** with shadcn/ui components
- **PWA** capabilities with service worker

### Database Schema
- Users (Replit auth integration)
- Students (with gamification features)
- Classes and Assignments
- Tasks with completion tracking
- Curriculum management system
- Lesson progress tracking

## Recent Changes

### January 20, 2025
- **Fixed Storage Layer**: Corrected imports from `./storage` to `./storage-replit`
- **Database Setup**: Properly configured Drizzle ORM, resolved "storage.upsertUser is not a function" error
- **OAuth Configuration**: Added ISSUER_URL environment variable for authentication
- **Runtime Error Investigation**: Systematically investigated React "Cannot read properties of null (reading 'useRef')" error
  - Disabled React StrictMode
  - Removed TooltipProvider component  
  - Temporarily disabled AILessonExtractor component
  - Created minimal React apps to isolate the issue
  - Identified that the error persists even with vanilla React class components
  - Root cause appears to be the Vite runtime error plugin conflicting with React hooks

### Current Status
- Application serving on port 5000 with database connected
- OAuth authentication configured but experiencing token exchange errors
- React runtime error plugin causing persistent useRef errors across all component types
- **SIMPLIFIED**: Reverted to basic planner functionality without complex UI dependencies to resolve runtime errors
- **SOLUTION FOUND**: Pure HTML/JavaScript planner at `/planner` route works without any runtime errors
- **NEXT STEPS**: Build upon working HTML foundation with database integration and enhanced features

## User Preferences
- Project uses PostgreSQL for production data persistence
- Prefers TypeScript for type safety
- Uses Drizzle ORM for database operations
- Follows fullstack JavaScript development guidelines

## Development Guidelines
- Always use `npm run db:push` for schema changes (never manual SQL migrations)
- Import storage from `./storage-replit` for database operations
- Follow existing TypeScript patterns and schemas
- Maintain consistency with Replit authentication flow
- Use shadcn/ui components for UI consistency

## Current Status
✅ **Enhanced Static Planner with Student Management**
- Server running on port 5000 with PostgreSQL database
- Static HTML planner at `/static-planner` bypasses all React runtime errors
- Full student management: add, view, delete students
- Task assignment to specific students or all students
- Online/offline synchronization with localStorage fallback
- Clean text-based UI with student cards and enhanced task display
- Database persistence for both tasks and students