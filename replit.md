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
**July 20, 2025**
- ✅ **Fixed Critical Storage Import Issue**: Updated `server/replitAuth.ts` to import from `./storage-replit` instead of `./storage`
- ✅ **Removed Legacy Storage**: Deleted outdated `server/storage.ts` file that was causing TypeScript errors
- ✅ **Database Migration**: Verified PostgreSQL schema is properly set up with `npm run db:push`
- ✅ **Application Startup**: Successfully resolved "storage.upsertUser is not a function" error
- ✅ **Server Running**: Application now starts successfully on port 5000

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
✅ **Application is running successfully**
- Server started on port 5000
- Database connected and schema deployed
- Authentication system ready
- All TypeScript errors resolved