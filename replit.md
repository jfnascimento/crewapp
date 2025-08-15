# Overview

CrewAI Studio is a comprehensive AI agent orchestration platform built as a full-stack web application. The system enables users to create, manage, and execute AI agent crews for content creation and task automation. It features a visual CrewAI Studio interface for designing agent workflows, multi-LLM provider support, knowledge base management, and real-time execution monitoring. The platform implements CrewAI best practices with sequential task execution, intelligent crew suggestions, and advanced agent configuration capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing with pattern matching
- **State Management**: TanStack Query (React Query) for server state management, caching, and synchronization
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens, CSS variables, and dark mode support
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express server providing RESTful API endpoints
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **API Design**: RESTful API with JSON responses, structured error handling, and request logging middleware
- **File Handling**: Multer middleware for file uploads with configurable size limits and storage paths
- **Development**: Hot module replacement with Vite integration for seamless development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Drizzle ORM with Neon Database serverless deployment
- **Schema Management**: Drizzle Kit for database migrations and schema synchronization
- **Vector Storage**: Qdrant integration for semantic search and knowledge base indexing capabilities
- **File Storage**: Local file system storage for uploaded knowledge base documents and assets
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple for user authentication

## Core Data Models
- **Projects**: Content creation projects with status tracking, progress monitoring, and team collaboration
- **Agents**: AI agents with configurable roles, goals, backstories, tool assignments, and LLM configurations
- **Tasks**: Individual tasks with descriptions, expected outputs, dependencies, and execution parameters
- **Crews**: Agent teams with defined processes (Sequential/Hierarchical), delegation rules, and workflow management
- **Executions**: Task execution records with real-time status updates, performance metrics, and result tracking
- **Knowledge Items**: Document management with metadata, file processing, and semantic indexing
- **LLM Configurations**: Multi-provider LLM settings with model selection, parameter tuning, and usage analytics

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage for persistent user authentication
- **User Profiles**: Basic user profile management with email, name, and avatar support
- **Access Control**: Role-based access patterns prepared for future RBAC implementation

## AI and LLM Integration
- **Multi-Provider Support**: Integrated support for Anthropic, Groq, Ollama, and OpenAI LLM providers
- **Model Management**: Automatic model discovery, health monitoring, and intelligent model assignment
- **CrewAI Integration**: Native CrewAI framework integration with sequential processes, agent delegation, and task orchestration
- **Knowledge Processing**: Document chunking, embedding generation, and vector storage for RAG capabilities

# External Dependencies

## AI and Machine Learning Services
- **Anthropic SDK**: Claude model integration for advanced reasoning and content generation
- **OpenAI/Groq APIs**: GPT model access and alternative high-performance inference endpoints
- **Ollama**: Local LLM deployment and management for privacy-focused AI operations
- **CrewAI Framework**: Core agent orchestration and workflow management (implied from architecture)

## Database and Storage
- **Neon Database**: Serverless PostgreSQL database with connection pooling and auto-scaling
- **Qdrant**: Vector database for semantic search, embeddings storage, and knowledge retrieval
- **Local File System**: Document storage with configurable upload directories and file management

## Development and Build Tools
- **Vite**: Frontend build tool with HMR, plugin ecosystem, and optimized production builds
- **TypeScript**: Type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database schema management, migrations, and ORM code generation
- **ESBuild**: Backend bundling for production deployment with ES modules support

## UI and Component Libraries
- **Radix UI**: Unstyled, accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with design system integration
- **Lucide React**: Consistent icon library with tree-shaking and customization support
- **React Hook Form**: Performance-optimized form handling with minimal re-renders

## Monitoring and Development
- **Replit Integration**: Development environment integration with runtime error overlays and cartographer plugins
- **TanStack Query**: Intelligent caching, background updates, and optimistic UI updates
- **Error Handling**: Comprehensive error boundaries and logging for debugging and monitoring