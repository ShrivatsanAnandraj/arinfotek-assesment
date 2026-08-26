# CodeLearn - AR INFOTEK Programming Learning Platform

A comprehensive web application for learning programming languages, built with React, Vite, Tailwind CSS, and PostgreSQL.

## Features

- **Authentication**: Login/Signup with username, email, password
- **Home Page**: Browse 12+ programming language cards
- **Tutorial Pages**: Structured lessons with examples
- **Code Workspace**: VS Code-like editor with live execution
- **Student Dashboard**: Track progress and saved files

## Supported Languages

1. Python
2. JavaScript
3. HTML
4. CSS
5. Java
6. Kotlin
7. C
8. C++
9. C#
10. Ruby
11. TypeScript
12. Go

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Editor**: Monaco Editor (VS Code editor)
- **Code Execution**: Piston API (browser-based)
- **Database**: PostgreSQL (Neon)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Database Setup

Run the SQL in `db/schema.sql` to create the required tables.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

## License

© 2025 AR INFOTEK – All rights reserved.
