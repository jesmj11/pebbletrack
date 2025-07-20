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
- **Completed Multi-Page Authentication System**: Implemented role-based login with proper access control
- **Database Integration**: Full PostgreSQL integration with localStorage fallback for offline use
- **Security Enhancement**: All pages now require authentication before access
- **UI Refinement**: Removed standalone parent reports button, integrated functionality into parent dashboard
- **Professional Design**: Consistent Pebble Track color palette across all interfaces
- **Static HTML Solution**: Successfully bypassed React/Vite runtime errors with pure HTML/CSS/JavaScript implementation

### Authentication System
- Teachers access dashboard and planner functionality
- Students access dedicated portal for task completion  
- Parents access comprehensive reporting dashboard (removed from login screen, accessible via teacher dashboard)
- All pages protected with localStorage-based session management
- Proper logout functionality across all interfaces

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
✅ **Complete Multi-Page Homeschool Management System**
- Server running on port 5000 with PostgreSQL database
- **Login Page** (`/login`): Professional role-based entry point
- **Dashboard** (`/static-dashboard`): Overview with statistics and quick actions
- **Student View** (`/student-view`): Dedicated student portal with task completion
- **Parent View** (`/parent-view`): Comprehensive reporting and progress tracking
- **Planner** (`/static-planner`): Full-featured task and student management
- All pages use Pebble Track color palette for cohesive professional design
- Complete offline/online synchronization with localStorage fallback
- Database persistence for both tasks and students across all interfaces