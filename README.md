# CollabNotes - Real-time Collaborative Notes Application

A full-stack real-time collaborative notes application built with React, Node.js, Express, PostgreSQL, and WebSockets.

## 🔗 Live Demo

- **Frontend (Vercel)**: https://hello-there-phi.vercel.app
- **Backend API (Railway)**: https://hello-there-production-4348.up.railway.app

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Architecture](#-architecture)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Local Development Setup](#-local-development-setup)
6. [Database Setup](#-database-setup)
7. [API Documentation](#-api-documentation)
8. [WebSocket Events](#-websocket-events)
9. [Deployment Guide](#-deployment-guide)
10. [Environment Variables](#-environment-variables)
11. [Test Accounts](#-test-accounts)

---

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing (bcrypt)
- **Role-Based Access Control**: Three roles - Admin, Editor, Viewer with different permissions
- **Real-time Collaboration**: Live collaborative editing using WebSockets (Socket.io)
- **Notes Management**: Full CRUD operations for notes
- **Activity Logging**: Track all user actions with timestamps
- **Shareable Links**: Generate public read-only links for sharing notes
- **Admin Panel**: User management dashboard for administrators
- **Responsive Design**: Mobile-friendly UI with TailwindCSS

---

## 🏗️ Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│                     │     │                     │     │                     │
│   React Frontend    │────▶│   Express Backend   │────▶│   PostgreSQL DB     │
│   (Vercel)          │     │   (Railway)         │     │   (Neon/Railway)    │
│                     │     │                     │     │                     │
└─────────────────────┘     └──────────┬──────────┘     └─────────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │                     │
                            │   Socket.io Server  │
                            │   (Real-time)       │
                            │                     │
                            └─────────────────────┘
```

**Data Flow:**
1. User interacts with React frontend
2. Frontend makes REST API calls to Express backend
3. Backend authenticates requests using JWT tokens
4. Prisma ORM handles database operations
5. Socket.io enables real-time updates across clients

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| TailwindCSS | Utility-first styling |
| React Query | Server state management |
| React Router v6 | Client-side routing |
| Socket.io Client | WebSocket communication |
| React Hook Form | Form handling |
| Zod | Schema validation |
| shadcn/ui | UI components |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| TypeScript | Type safety |
| Prisma | ORM for PostgreSQL |
| PostgreSQL | Relational database |
| Socket.io | WebSocket server |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| Zod | Request validation |

---

## 📁 Project Structure

```
collabnotes/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── layout/              # Header, MainLayout
│   │   └── ui/                  # shadcn/ui components
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx     # Authentication state
│   ├── hooks/                   # Custom React hooks
│   │   ├── useNotes.ts         # Notes CRUD operations
│   │   ├── useActivity.ts      # Activity log fetching
│   │   └── useWebSocket.ts     # Socket.io connection
│   ├── pages/                   # Page components
│   │   ├── auth/               # Login, Register pages
│   │   ├── notes/              # Notes list, editor, public view
│   │   ├── ActivityPage.tsx    # Activity logs
│   │   ├── AdminPage.tsx       # Admin panel
│   │   └── Index.tsx           # Home/landing page
│   ├── config/                  # Configuration
│   │   └── api.ts              # API endpoints
│   ├── types/                   # TypeScript types
│   └── lib/                     # Utility functions
│
├── backend-code/                 # Backend source code
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   ├── notes.ts        # Notes CRUD endpoints
│   │   │   ├── activity.ts     # Activity log endpoints
│   │   │   └── admin.ts        # Admin endpoints
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── validate.ts     # Request validation
│   │   │   └── errorHandler.ts # Error handling
│   │   ├── schemas/             # Zod validation schemas
│   │   ├── services/            # Business logic
│   │   ├── socket/              # WebSocket handlers
│   │   ├── lib/                 # Prisma client
│   │   └── index.ts             # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Database seeding
│   └── package.json
│
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind configuration
├── vercel.json                  # Vercel deployment config
└── package.json                 # Frontend dependencies
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud like Neon)
- Git

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd collabnotes
```

### Step 2: Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create frontend environment file
# Create a file named .env in the root directory with:
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001

# Start frontend development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend-code

# Install backend dependencies
npm install

# Create backend environment file
cp .env.example .env

# Edit .env file with your database credentials:
DATABASE_URL="postgresql://username:password@localhost:5432/collabnotes?schema=public"
JWT_SECRET="your-super-secret-key-min-32-characters"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### Step 4: Database Setup

```bash
# In backend-code directory

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed test data
npm run db:seed
```

### Step 5: Start Backend Server

```bash
# In backend-code directory
npm run dev
# Backend runs on http://localhost:3001
```

---

## 🗄️ Database Setup

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE collabnotes;
```
3. Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/collabnotes?schema=public"
```

### Option B: Neon (Cloud PostgreSQL) - Recommended for Production

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(editor)  // admin, editor, viewer
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Note {
  id        String   @id @default(cuid())
  title     String
  content   String   @default("")
  ownerId   String
  shareId   String?  @unique
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model NoteCollaborator {
  id        String   @id @default(cuid())
  noteId    String
  userId    String
  role      String   @default("viewer")
  createdAt DateTime @default(now())
}

model Activity {
  id        String   @id @default(cuid())
  action    String
  details   String?
  noteId    String?
  userId    String
  createdAt DateTime @default(now())
}
```

### Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and apply migrations (development)
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with test data
npm run db:seed
```

---

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:3001/api`
- **Production**: `https://hello-there-production-4348.up.railway.app/api`

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |

#### POST /auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

// Response
{
  "token": "jwt-token-here",
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "editor"
  }
}
```

#### POST /auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "jwt-token-here",
  "user": { ... }
}
```

### Notes Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/notes` | Get all user's notes | Yes |
| GET | `/notes/:id` | Get single note | Yes |
| POST | `/notes` | Create new note | Yes |
| PUT | `/notes/:id` | Update note | Yes |
| DELETE | `/notes/:id` | Delete note | Yes |
| POST | `/notes/:id/share` | Generate share link | Yes |
| GET | `/notes/public/:shareId` | Get public note | No |

#### POST /notes
```json
// Request (Authorization: Bearer <token>)
{
  "title": "My Note",
  "content": "Note content here"
}

// Response
{
  "id": "cuid",
  "title": "My Note",
  "content": "Note content here",
  "ownerId": "user-cuid",
  "isPublic": false,
  "shareId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Activity Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/activity` | Get activity logs | Yes |

### Admin Endpoints (Admin role required)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users | Yes (Admin) |
| PUT | `/admin/users/:id/role` | Update user role | Yes (Admin) |
| DELETE | `/admin/users/:id` | Delete user | Yes (Admin) |

---

## 🔌 WebSocket Events

### Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token: 'jwt-token-here' }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-note` | `{ noteId: string }` | Join a note's collaboration room |
| `leave-note` | `{ noteId: string }` | Leave a note's collaboration room |
| `note-update` | `{ noteId: string, content: string, title: string }` | Send note changes |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `note-updated` | `{ noteId, content, title, updatedBy }` | Receive note changes |
| `user-joined` | `{ noteId, userId, userName }` | User joined the note |
| `user-left` | `{ noteId, userId }` | User left the note |
| `collaborators` | `{ noteId, users: [] }` | Current collaborators list |

---

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access: manage users, delete any note, view all activity |
| **Editor** | Create notes, edit own notes, view own activity |
| **Viewer** | Read-only access to notes shared with them |

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)

1. **Push code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Build Settings**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   VITE_WS_URL=https://your-backend-url.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will auto-deploy on every push to main branch

### Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service**
   - Set **Root Directory**: `backend-code`
   - Set **Build Command**: `npm install && npx prisma generate && npm run build`
   - Set **Start Command**: `npx prisma migrate deploy && npm start`

4. **Add PostgreSQL Database** (if not using Neon)
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway auto-populates `DATABASE_URL`

5. **Set Environment Variables**
   ```
   DATABASE_URL=<your-neon-or-railway-postgres-url>
   JWT_SECRET=<generate-secure-random-string>
   FRONTEND_URL=https://your-frontend.vercel.app
   PORT=3001
   ```

6. **Deploy**
   - Railway auto-deploys on push
   - Check logs for any errors

### Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Can create, edit, delete notes
- [ ] Real-time collaboration works (open in two browsers)
- [ ] Activity logs show actions
- [ ] Admin panel works for admin users
- [ ] Share links work for public notes

---

## 📋 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.railway.app/api
VITE_WS_URL=https://your-backend-url.railway.app
```

### Backend (backend-code/.env)
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT Secret (min 32 characters)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"

# Server
PORT=3001

# CORS - Frontend URL(s)
FRONTEND_URL="https://your-frontend.vercel.app"
# For multiple origins:
# FRONTEND_URLS="https://app1.vercel.app,https://app2.vercel.app"
```

---

## 👤 Test Accounts

After running `npm run db:seed` in the backend:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@collabnotes.com | admin123 |
| Editor | editor@collabnotes.com | editor123 |
| Viewer | viewer@collabnotes.com | viewer123 |

---

## 📝 License

MIT License

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
