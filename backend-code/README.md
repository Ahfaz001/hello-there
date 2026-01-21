# CollabNotes Backend

Real-time collaborative notes API built with Node.js, Express, Prisma, and Socket.io.

## Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Setup database**
```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed  # Optional: seed test data
```

4. **Run development server**
```bash
npm run dev
```

## Deployment to Railway

1. Create a new Railway project
2. Add PostgreSQL database
3. Connect your GitHub repository
4. Set environment variables:
   - `DATABASE_URL` (auto-populated from Railway PostgreSQL)
   - `JWT_SECRET` (generate a secure random string)
   - `FRONTEND_URL` (your Vercel frontend URL)

5. Railway will auto-deploy on push

## Test Accounts (after seeding)

- Admin: admin@collabnotes.com / admin123
- Editor: editor@collabnotes.com / editor123
- Viewer: viewer@collabnotes.com / viewer123
