# CodeLearn - Programming Learning Platform

## Overview
A comprehensive web application for learning programming languages, built with React, Vite, Tailwind CSS, and PostgreSQL (Neon). Features authentication, interactive tutorials, code execution workspace, and student dashboard.

## Project Structure

```
courses-arinfotek-page/
├── public/
│   └── arinfotek_logo.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignupPage.jsx
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   ├── Home/
│   │   │   └── HomePage.jsx
│   │   ├── Languages/
│   │   │   ├── LanguageCard.jsx
│   │   │   └── languages.js
│   │   ├── Tutorial/
│   │   │   ├── TutorialPage.jsx
│   │   │   ├── TopicList.jsx
│   │   │   └── TopicContent.jsx
│   │   ├── Workspace/
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── Terminal.jsx
│   │   │   └── FileManager.jsx
│   │   └── Dashboard/
│   │       ├── StudentDashboard.jsx
│   │       └── StatsCard.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── services/
│   │   ├── api.js
│   │   └── codeExecutor.js
│   └── data/
│       ├── python.js
│       ├── javascript.js
│       ├── html.js
│       ├── css.js
│       ├── java.js
│       ├── kotlin.js
│       ├── c.js
│       ├── cpp.js
│       ├── csharp.js
│       └── ruby.js
├── api/
│   ├── auth.js
│   ├── files.js
│   └── stats.js
├── db/
│   └── schema.sql
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

## Features

### 1. Authentication System
- **Login Page**: Username/password login with validation
- **Signup Page**: Username/email/password registration
- **Auth Context**: React context for managing authentication state
- **Protected Routes**: Redirect to login if not authenticated
- **Password Hashing**: bcrypt for secure password storage

### 2. Home Page
- **Hero Section**: Gradient background matching arinfotek.co.in style
- **Logo**: Assessment.arinfotek.co.in logo in header
- **Language Grid**: 10+ programming language cards with icons
- **Responsive Design**: Works on all screen sizes

### 3. Supported Languages
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
11. Swift
12. TypeScript

### 4. Tutorial Pages
- **Language Introduction**: Overview of each language
- **Agenda/Topic List**: Clickable table of contents
- **Topic Content**: Detailed explanations with examples
- **Try Yourself Button**: Opens workspace with example code
- **Progress Tracking**: Mark topics as completed

### 5. Code Workspace
- **Monaco Editor**: VS Code-like code editor
- **File Manager**: Create, save, load, and delete files
- **Terminal**: Execute code using Piston API
- **Error Display**: Show compilation/execution errors
- **Package Installation**: Simulated package manager

### 6. Student Dashboard
- **Profile Section**: User information display
- **Learning Progress**: Topics completed per language
- **Statistics**: Time spent, code runs, tutorials completed
- **Saved Files**: List of all saved code files
- **Recent Activity**: Last 10 actions

## Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved files table
CREATE TABLE saved_files (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  topic VARCHAR(100) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, language, topic)
);

-- Stats table
CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  total_time_seconds INT DEFAULT 0,
  tutorials_completed INT DEFAULT 0,
  code_runs INT DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW()
);
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user info

### Files
- `GET /api/files` - Get all files for user
- `POST /api/files` - Save a new file
- `PUT /api/files/:id` - Update existing file
- `DELETE /api/files/:id` - Delete a file

### Progress & Stats
- `GET /api/progress` - Get user's progress
- `POST /api/progress` - Update topic completion
- `GET /api/stats` - Get user statistics
- `POST /api/stats` - Update user stats

## Code Execution

Using Piston API (https://emkc.org/piston/api) for browser-based code execution:

```javascript
const executeCode = async (language, code) => {
  const response = await fetch('https://emkc.org/piston/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: language,
      version: 'latest',
      files: [{ content: code }]
    })
  });
  return response.json();
};
```

## Styling

- **Primary Color**: #1e5aa8 (AR INFOTEK blue)
- **Accent Color**: #ff891c (Orange)
- **Background**: Gradient from blue to dark blue
- **Cards**: White with subtle shadows
- **Typography**: Clean, modern sans-serif

## Implementation Steps

1. ✅ Create project structure
2. ✅ Set up authentication context and components
3. ✅ Build home page with language grid
4. ✅ Create tutorial pages with content
5. ✅ Implement code workspace with Monaco editor
6. ✅ Add file management system
7. ✅ Create student dashboard
8. ✅ Set up API routes
9. ✅ Create database schema
10. ✅ Test and deploy to Vercel

## Environment Variables

```env
# Database URL (provided later)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key-here
```

## Deployment

1. Push to GitHub main branch
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

## Dependencies

```json
{
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@monaco-editor/react": "^4.6.0",
    "react-router-dom": "^6.23.0",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.4",
    "tailwindcss": "^4.1.4",
    "vite": "^6.3.5"
  }
}
```
