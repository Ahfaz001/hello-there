# CollabNotes - Real-time Collaborative Notes Application

A full-stack real-time collaborative notes application built with React, Node.js, Express, PostgreSQL, and WebSockets.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control (Admin, Editor, Viewer)
- **Real-time Collaboration**: Live collaborative editing using WebSockets
- **Notes Management**: Create, read, update, and delete notes with rich content
- **Activity Logging**: Track all changes with detailed activity logs
- **Search & Filter**: Full-text search across all notes
- **Shareable Links**: Create public read-only links for sharing notes
- **Admin Panel**: User management for administrators

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express API    │────▶│  PostgreSQL     │
│  (Vercel)       │     │  (Railway)      │     │  Database       │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │                 │
                        │  Socket.io      │
                        │  WebSocket      │
                        │                 │
                        └─────────────────┘
```

## 📁 Project Structure

### Frontend (React + TypeScript + Vite)
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Header, MainLayout
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom hooks (useNotes, useActivity, useWebSocket)
├── pages/              # Page components
│   ├── auth/           # Login, Register
│   ├── notes/          # NotesListPage, NoteEditorPage, PublicNotePage
│   ├── ActivityPage    # Activity logs
│   └── AdminPage       # Admin panel
├── types/              # TypeScript types
└── config/             # API configuration
```

### Backend (Node.js + Express + Prisma)
```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, validation middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── socket/         # WebSocket handlers
│   └── utils/          # Helpers
├── prisma/
│   └── schema.prisma   # Database schema
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Server state management
- **React Router** - Routing
- **Socket.io Client** - WebSocket client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Frontend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd collabnotes-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

4. Start development server
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```env
DATABASE_URL="postgresql://user:password@localhost:5432/collabnotes"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the server
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes |
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

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |

## 🔌 WebSocket Events

### Client → Server
- `join-note` - Join a note room for collaboration
- `leave-note` - Leave a note room
- `note-update` - Send note changes

### Server → Client
- `note-updated` - Receive note changes
- `user-joined` - User joined the note
- `user-left` - User left the note
- `collaborators` - List of active collaborators

## 🔐 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, manage users, delete any note |
| **Editor** | Create, edit own notes, view all notes |
| **Viewer** | Read-only access to notes |

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway)
1. Push code to GitHub
2. Create new Railway project
3. Add PostgreSQL database
4. Set environment variables
5. Deploy

## 📝 Environment Variables

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_WS_URL` | WebSocket server URL |

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `PORT` | Server port |
| `FRONTEND_URL` | Frontend URL for CORS |

## 📄 License

MIT License

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
