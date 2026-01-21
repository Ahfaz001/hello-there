# CollabNotes Backend API

Real-time collaborative notes API built with Node.js, Express, Prisma, and Socket.io.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Neon)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. (Optional) Seed test data
npm run db:seed

# 6. Start development server
npm run dev
```

Server runs on `http://localhost:3001`

---

## 🗄️ Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration (development)
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Open database GUI
npx prisma studio

# Reset database (deletes all data!)
npx prisma migrate reset

# Seed database
npm run db:seed
```

---

## 🚀 Deployment to Railway

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository

### Step 2: Configure Service Settings
- **Root Directory**: `backend-code`
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm start`

### Step 3: Set Environment Variables
```
DATABASE_URL=<your-neon-postgres-connection-string>
JWT_SECRET=<secure-random-string-32-chars-minimum>
FRONTEND_URL=https://your-vercel-frontend.vercel.app
PORT=3001
```

### Step 4: Deploy
Railway auto-deploys when you push to the main branch.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user (requires auth) |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all user's notes |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| POST | `/api/notes/:id/share` | Generate share link |
| GET | `/api/notes/public/:shareId` | Get public note |

### Activity
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activity` | Get activity logs |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

---

## 🔌 WebSocket Events

### Client → Server
- `join-note` - Join collaboration room
- `leave-note` - Leave collaboration room
- `note-update` - Send note changes

### Server → Client
- `note-updated` - Receive note changes
- `user-joined` - User joined note
- `user-left` - User left note
- `collaborators` - Active collaborators list

---

## 👤 Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@collabnotes.com | admin123 |
| Editor | editor@collabnotes.com | editor123 |
| Viewer | viewer@collabnotes.com | viewer123 |

---

## 📁 Project Structure

```
backend-code/
├── src/
│   ├── index.ts           # Server entry point
│   ├── routes/
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── notes.ts       # Notes CRUD
│   │   ├── activity.ts    # Activity logs
│   │   └── admin.ts       # Admin endpoints
│   ├── middleware/
│   │   ├── auth.ts        # JWT verification
│   │   ├── validate.ts    # Request validation
│   │   └── errorHandler.ts
│   ├── schemas/           # Zod validation schemas
│   ├── services/          # Business logic
│   ├── socket/            # WebSocket handlers
│   └── lib/
│       └── prisma.ts      # Prisma client
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | `your-super-secret-key-here` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://app.vercel.app` |
| `FRONTEND_URLS` | Multiple frontend URLs (comma-separated) | `https://app1.com,https://app2.com` |
