# Application Architecture

## Technology Stack

### Application

Next.js

Use:

- App Router
- TypeScript
- Server Components where appropriate
- Server Actions or API routes where appropriate

### Styling

- Tailwind CSS
- shadcn/ui

### Backend

Supabase

Use Supabase for:

- PostgreSQL database
- Authentication
- File storage

### AI

OpenAI API

Use OpenAI for:

- audio transcription
- call analysis
- coaching feedback

### Deployment

Vercel

---

# High-Level Architecture

User

↓

Next.js Application

↓

Supabase

- Authentication
- Database
- Audio Storage

↓

OpenAI

- Transcription
- Analysis

---

# Call Processing Flow

User uploads call

↓

Store audio file

↓

Create call database record

↓

Send audio for transcription

↓

Save transcript

↓

Load selected call framework

↓

Send framework + transcript to AI analysis

↓

Validate structured AI response

↓

Calculate/store scores

↓

Save analysis

↓

Display call report

---

# Important Architecture Rules

## AI

AI calls must happen server-side.

Never expose the OpenAI API key to the browser.

## Database

Supabase credentials must use environment variables.

## Business Logic

Keep these separate:

- transcription
- call analysis
- scoring
- database operations
- UI

Do not put everything inside React components.

## Validation

Validate:

- uploaded files
- user input
- AI responses
- database input

## Security

Users should only access data belonging to their organization.

Database security should eventually use Supabase Row Level Security.

## Simplicity

Do not introduce:

- microservices
- queues
- Redis
- Docker infrastructure
- complex event systems

unless there is a demonstrated need.

The MVP should remain a simple Next.js application.