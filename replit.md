# ScreenEdit Pro - Online Screenshot Editor

## Overview
ScreenEdit Pro is a modern web-based screenshot and image editing application built with React, TypeScript, and Express.js. The application provides a free, no-signup-required image editing experience with professional-grade tools for cropping, filtering, text overlay, and AI-powered OCR text recognition for seamless screenshot editing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **State Management**: React hooks for local state, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Image Processing**: HTML5 Canvas API with custom ImageEditor class for client-side image manipulation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL session store
- **Development**: Hot reload with Vite integration for full-stack development

### Build System
- **Bundler**: Vite for frontend, ESBuild for backend production builds
- **Development**: Concurrent frontend/backend development with shared TypeScript configuration
- **Production**: Static asset serving with Express for SPA deployment

## Key Components

### Image Editor Engine
- **Canvas-based Processing**: HTML5 Canvas for real-time image manipulation
- **AI Text Recognition**: OpenAI GPT-4o powered OCR for automatic text extraction from images
- **Interactive Elements**: Click-to-select and drag-to-move functionality for text and shapes
- **Smart Text Editing**: Preserves original formatting (font size, color, style) when editing detected text
- **Element Management**: Full CRUD operations on text and shape elements with live editing
- **Tool System**: Modular tool architecture (select, OCR extract, crop, text, shapes, filters, resize)
- **History Management**: Undo/redo functionality with ImageData snapshots
- **Real-time Editing**: Live property updates for selected elements (font size, color, position)
- **Export System**: Multiple format support (PNG, JPG) with quality optimization

### UI Components
- **Upload Section**: Drag-and-drop file upload with validation and preview
- **Editor Section**: Main editing interface with tool palette and canvas
- **Features Section**: Marketing component showcasing application capabilities
- **SEO Components**: Structured data and meta tag management for search optimization

### Data Storage
- **User System**: Basic user schema with authentication support (prepared but not implemented)
- **Memory Storage**: In-memory storage implementation for development
- **Database Integration**: Drizzle ORM configured for PostgreSQL with migration support

## Data Flow

1. **Image Upload**: User selects/drops image file → File validation → Base64 conversion → ImageEditor initialization
2. **OCR Processing**: User triggers text extraction → OpenAI GPT-4o analysis → Text element detection → Canvas overlay
3. **Text Editing**: User selects detected text → In-place editing with preserved formatting → Real-time canvas updates
4. **Image Processing**: Tool selection → Canvas manipulation → Real-time preview → History tracking
5. **Export Process**: User triggers download → Canvas export → File download via browser

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for production database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library

### UI Dependencies
- **@radix-ui/***: Comprehensive UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **react-dropzone**: File upload handling

### Development Dependencies
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Full-stack development with automatic restart
- **Database**: PostgreSQL module in Replit environment

### Production Deployment
- **Build Process**: `npm run build` creates optimized static assets and server bundle
- **Deployment Target**: Autoscale deployment on Replit
- **Port Configuration**: Express server on port 5000, external port 80
- **Asset Serving**: Static file serving for React SPA with Express fallback

### Database Strategy
- **Development**: Local PostgreSQL or Neon Database
- **Production**: Neon Database with connection pooling
- **Migrations**: Drizzle Kit for schema management and migrations

## Changelog
- June 27, 2025. Initial setup
- June 27, 2025. Enhanced image editor with interactive element editing:
  - Added click-to-select functionality for text and shapes
  - Implemented drag-and-drop repositioning of elements
  - Added real-time property editing for selected elements
  - Enhanced UI with element-specific tools and deletion options
  - Added comprehensive help guide for users
- June 28, 2025. Added AI-powered OCR text recognition:
  - Integrated OpenAI GPT-4o for automatic text extraction from images
  - Built OCR API endpoints with Zod validation
  - Enhanced ImageEditor class with OCR functionality
  - Added OCR tool to editor interface with confidence scoring
  - Implemented smart text editing that preserves original formatting
  - Updated UI to highlight OCR capabilities in features and help sections

## User Preferences
Preferred communication style: Simple, everyday language.