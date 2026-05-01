# TaskFlow Management System

TaskFlow is a professional, full-stack team management application built with React, Node.js, Express, and Prisma. It features a stunning dark-mode dashboard, real-time task management, attendance tracking, and leave management systems.

## Key Features
- **Interactive Dashboard:** Strategic overview with dynamic charts and stat cards.
- **Kanban Task Board:** Drag-and-drop task management with role-based visibility.
- **Team Management:** Detailed member profiles and task assignment.
- **Attendance System:** Sign-in/Sign-out tracking with check-in history.
- **Leave Management:** Request and approve/reject leaves with automated status updates.
- **Responsive UI:** Professional, high-contrast dark theme optimized for performance.

## Technology Stack
- **Frontend:** React (Vite), Tailwind CSS, Zustand, Lucide React, Recharts.
- **Backend:** Node.js, Express, Prisma (SQLite).
- **Database:** SQLite (local).

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install` to install dependencies.
3. Run `npx prisma db push` to initialize the database.
4. Run `npm run dev` to start the backend server on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a terminal in the `frontend` folder.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the frontend server on `http://localhost:5173`.

## Deployment
To deploy this application:
- **Frontend:** Can be deployed to Vercel or Netlify.
- **Backend:** Can be deployed to Render, Railway, or Heroku.
- **Database:** Replace SQLite with PostgreSQL/MySQL for production use.

## License
ISC
