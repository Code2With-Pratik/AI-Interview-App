# InterviewAI - AI-Powered Interview Platform Setup Guide

## Overview
InterviewAI is a complete AI-powered interview preparation platform that uses voice-to-voice interaction, Gemini AI for question generation, and real-time feedback. The platform includes:

- User authentication (registration/login)
- 3 interview input methods (resume, job description, manual)
- Dynamic AI question generation with follow-ups
- Voice-enabled interview interface
- Real-time AI feedback with ratings
- Dashboard with interview history and statistics
- Interview retake capability

## Prerequisites

1. **Node.js 18+** and **pnpm** (or npm)
2. **Neon PostgreSQL Database** (free tier available at https://neon.tech)
3. **Google Gemini API Key** (free tier available at https://ai.google.dev)
4. **Vercel Account** (for deployment, optional for local development)

## Environment Setup

### 1. Neon Database Setup

1. Go to [Neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy the connection string (DATABASE_URL)

### 2. Google Gemini API Setup

1. Go to [Google AI Studio](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy the API key (GOOGLE_API_KEY)

### 3. Local Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://user:password@host/database
GOOGLE_API_KEY=your_google_api_key_here
JWT_SECRET=your_secret_key_change_in_production_12345
```

## Installation & Running

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Initialize Database
The database schema is automatically created when the app starts. The SQL migrations are in `/scripts/init-db.js`.

### 3. Run Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production
```bash
pnpm build
pnpm start
```

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   └── register/page.tsx    # Registration page
│   ├── dashboard/
│   │   ├── page.tsx             # Dashboard/Home
│   │   └── history/page.tsx     # Interview history
│   ├── interview/
│   │   ├── setup/page.tsx       # Interview setup (3 methods)
│   │   ├── [id]/page.tsx        # Interview interface (voice)
│   │   └── [id]/feedback/page.tsx # Results & feedback
│   └── api/
│       ├── auth/                # Authentication routes
│       ├── interview/           # Interview logic
│       └── user/                # User profile
├── lib/
│   ├── db.ts                    # Database utilities
│   ├── auth.ts                  # Authentication utilities
├── scripts/
│   └── init-db.js               # Database initialization
├── components/ui/               # shadcn/ui components
└── package.json
```

## Feature Details

### 1. Authentication
- Email/password registration and login
- JWT-based session management
- httpOnly cookies for security
- Password hashing with bcryptjs

### 2. Interview Setup (3 Methods)
- **Resume Based**: Upload PDF or paste resume text
- **Job Description**: Paste the job description
- **Manual Selection**: Select skills, languages, and experience level

### 3. AI Question Generation
- Gemini AI generates 5 base questions
- Questions tailored to user's resume, JD, or profile
- Follow-up questions generated based on answers (1-2 per base question)
- Questions stored in database for tracking

### 4. Voice Interface
- **Text-to-Speech**: Questions read aloud using Web Speech API
- **Speech-to-Text**: Answers captured using browser's speech recognition
- **Text Fallback**: Users can type answers if voice isn't available
- Toggle voice on/off during interview

### 5. AI Feedback System
- Gemini AI evaluates each answer
- Ratings from 1-10 per answer
- Detailed feedback with suggestions
- Overall score calculated as average of all ratings
- Follow-up questions suggested based on answer quality

### 6. Dashboard & History
- View all completed and in-progress interviews
- Statistics: total interviews, average score, weekly count, improvement %
- Detailed interview history with filtering
- Quick access to view feedback

### 7. Interview Retake
- Users can retake interviews with same conditions
- Maintains history of all attempts
- Tracks improvement across retakes

## Key Technologies

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (Neon) with raw SQL
- **AI**: Google Gemini API for question generation and feedback
- **Auth**: JWT + httpOnly Cookies
- **UI**: shadcn/ui + Tailwind CSS
- **Voice**: Web Speech API (Speech Recognition & Synthesis)
- **Package Manager**: pnpm

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Interview
- `POST /api/interview/setup` - Start new interview
- `GET /api/interview/list` - Get user's interviews
- `GET /api/interview/[id]/questions` - Get interview questions
- `POST /api/interview/[id]/answer` - Submit answer
- `GET /api/interview/[id]/feedback` - Get feedback

### User
- `GET /api/user/profile` - Get user profile

## Database Schema

### Tables
- `users` - User accounts
- `sessions` - Active sessions
- `resumes` - Uploaded/pasted resumes
- `manual_inputs` - User profiles (skills, languages, etc.)
- `interviews` - Interview records
- `questions` - Interview questions (base + follow-ups)
- `answers` - User answers with feedback and ratings

## Security Features

✅ Password hashing with bcryptjs
✅ JWT authentication with expiration
✅ httpOnly cookies (CSRF protection)
✅ SQL parameterized queries (prevent SQL injection)
✅ User isolation (can only see own data)
✅ Session validation on every request
✅ Environment variables for sensitive data

## Known Limitations & Future Improvements

**Current Limitations:**
- PDF parsing not yet implemented (text input available)
- Speech recognition limited to browser support (Chrome, Edge, Safari)
- Free tier rate limits on Gemini API

**Future Enhancements:**
- PDF resume parsing
- Multiple language support
- Video interview recording
- Peer comparison analytics
- Interview templates library
- Company-specific interview prep

## Troubleshooting

### "Unauthorized" Error
- Check if auth token cookie is set
- Verify JWT_SECRET matches
- Clear cookies and login again

### "Database connection error"
- Verify DATABASE_URL is correct
- Check Neon project is active
- Ensure network access is allowed

### "API rate limit exceeded"
- Google Gemini API has free tier limits
- Consider upgrading or implementing caching

### "Speech recognition not working"
- Use HTTPS (required by Web Speech API)
- Use supported browser (Chrome, Edge, Safari)
- Grant microphone permissions

## Support & Feedback

For issues, questions, or feature requests:
- Check the troubleshooting section above
- Review the code comments
- Check browser console for errors

## License

This project is provided as-is for educational and commercial use.
