# DiaPet

## Overview

DiaPet is an educational virtual pet application designed to help children learn diabetes management through interactive gameplay. Users adopt and care for a virtual pet, managing its blood sugar levels through feeding, insulin administration, and monitoring activities. The app gamifies diabetes education with a playful, kid-friendly interface featuring bouncy animations and colorful visuals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with custom theme configuration for kid-friendly colors (bright blues, soft oranges, health greens)
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Animations**: Framer Motion for playful, bouncy interactions
- **Typography**: Custom fonts including "Architects Daughter" for display text and "DM Sans" for body text

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Build System**: Custom build script using esbuild for server bundling and Vite for client

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines all database tables
- **Migrations**: Drizzle Kit for schema management (`drizzle-kit push`)
- **Key Tables**:
  - `users` - User accounts (required for Replit Auth)
  - `sessions` - Session storage for authentication
  - `pets` - Virtual pet entities with health metrics (blood sugar, insulin, hunger, energy)
  - `foods` - Food items with carb impact and health values
  - `conversations/messages` - AI chat integration

### Authentication
- **Provider**: Replit Auth via OpenID Connect
- **Session Management**: PostgreSQL-backed sessions using `connect-pg-simple`
- **Implementation**: Located in `server/replit_integrations/auth/`

### Shared Code
- **Location**: `shared/` directory contains code shared between client and server
- **Path Aliases**: `@shared/*` maps to shared modules, `@/*` maps to client source

## External Dependencies

### Third-Party Services
- **Replit Auth**: OpenID Connect authentication integration
- **OpenAI API**: Powers AI chat functionality and image generation (via Replit AI Integrations)
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Database
- **PostgreSQL**: Primary data store
  - Connection via `DATABASE_URL` environment variable
  - Required for both application data and session storage

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `ISSUER_URL` - OpenID Connect issuer (defaults to Replit)
- `REPL_ID` - Replit environment identifier
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL

### Key NPM Dependencies
- `drizzle-orm` / `drizzle-kit` - Database ORM and migration tooling
- `@tanstack/react-query` - Async state management
- `framer-motion` - Animation library
- `openid-client` - OpenID Connect client for authentication
- `passport` - Authentication middleware
- `openai` - AI integration client