# InterviewAI

<img width="1900" height="1077" alt="image" src="https://github.com/user-attachments/assets/2ba445b4-cd21-48b8-9b0e-12b9df7413d0" />


InterviewAI is an AI-powered interview practice platform built with Next.js. Users can create accounts, prepare interviews from a resume or job description, answer questions by voice or text, and receive Gemini-generated feedback and ratings.

## Features

- Email/password authentication with JWT and HTTP-only cookies
- Resume, job-description, and manual interview setup
- AI-generated technical and behavioral questions
- Voice input and text-to-speech interview experience
- Answer ratings and detailed feedback
- Interview history, dashboard statistics, and retakes
- PostgreSQL persistence through Neon

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- PostgreSQL hosted by Neon
- Raw SQL through `@neondatabase/serverless`
- Google Gemini API using `gemini-3.5-flash`
- JWT, `jsonwebtoken`, and `bcryptjs`
- Tailwind CSS and Radix UI
- Web Speech API for browser voice features

## Requirements

- Node.js 18 or newer
- npm (or another compatible package manager)
- A Neon PostgreSQL database
- A Google Gemini API key
- A modern browser for speech recognition features

## Installation

Clone the repository and enter the project directory:

```bash
git clone <your-repository-url>
cd AI_Interview_NextJS-master
```

Install dependencies:

```bash
npm install
```

## Create the environment file

Create a file named `.env.local` in the project root. Do not commit this file.

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
GOOGLE_API_KEY=your_google_ai_studio_api_key
JWT_SECRET=your_generated_jwt_secret
NODE_ENV=development
```

### Neon PostgreSQL

1. Create an account at [Neon](https://neon.tech).
2. Create a project and database.
3. Copy the pooled or direct connection string.
4. Add it as `DATABASE_URL` in `.env.local`.

The application uses PostgreSQL tables including `users`, `sessions`, `resumes`, `manual_inputs`, `interviews`, `questions`, and `answers`.

### Google Gemini

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create an API key.
3. Add it as `GOOGLE_API_KEY` in `.env.local`.

The project currently uses `gemini-3.5-flash` in:

- `app/api/interview/setup/route.ts`
- `app/api/interview/[id]/answer/route.ts`

If Google changes model availability, update the model name in both files and use a model available to your API key.

### Generate a secure JWT secret

Run this command from the project directory:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `.env.local`:

```env
JWT_SECRET=paste_the_generated_value_here
```

Changing `JWT_SECRET` invalidates existing login tokens, so users will need to sign in again.

## Initialize the database

The schema is created by `scripts/init-db.js`. This script reads `DATABASE_URL` from `.env.local`.

```bash
node scripts/init-db.js
```

Run this command whenever you create a new Neon database or deploy against an empty database. It is safe to run again because the tables use `CREATE TABLE IF NOT EXISTS`.

## Run locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful production commands:

```bash
npm run build
npm start
```

The available npm scripts are:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Add these Environment Variables in the Vercel project settings:

   - `DATABASE_URL`
   - `GOOGLE_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`

4. Deploy the application.
5. If the Neon database is empty, run `node scripts/init-db.js` locally with the production `DATABASE_URL`, or execute the SQL from `scripts/init-db.sql` in Neon before using the deployed app.

Never place API keys, database passwords, or JWT secrets in source code, screenshots, README files, or Git history.

## Project structure

```text
app/
  api/                  API routes for auth, interviews, answers, and feedback
  auth/                 Login and registration pages
  dashboard/            Dashboard and interview history
  interview/            Interview setup, session, and feedback pages
components/             Shared UI components
lib/
  auth.ts               Password hashing, JWT, and auth cookies
  db.ts                 PostgreSQL queries and data access
  pdf-parser.ts         Resume text extraction
scripts/
  init-db.js            Create the PostgreSQL schema
  init-db.sql            SQL schema definition
  reset-db.js            Remove application tables
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Log in a user |
| `POST` | `/api/auth/logout` | Log out a user |
| `POST` | `/api/interview/setup` | Create an interview and questions |
| `GET` | `/api/interview/list` | List the current user's interviews |
| `GET` | `/api/interview/[id]/questions` | Get interview questions |
| `POST` | `/api/interview/[id]/answer` | Submit an answer and generate feedback |
| `GET` | `/api/interview/[id]/feedback` | Get interview feedback |
| `GET` | `/api/user/profile` | Get the current user's profile |

## Troubleshooting

### `relation "users" does not exist`

The database schema has not been initialized, or the app is using a different `DATABASE_URL`. Verify `.env.local`, then run:

```bash
node scripts/init-db.js
```

### Gemini returns `404` for a model

Confirm that the model name in both interview API routes is available to your Google API key. The current project configuration uses `gemini-3.5-flash`. Also confirm that `GOOGLE_API_KEY` is set in `.env.local`, then restart the development server.

### Authentication stops working after changing `JWT_SECRET`

This is expected. Delete the old auth cookie and log in again. Existing tokens were signed with the previous secret.

### Voice input does not work

Use a supported browser such as Chrome or Edge, allow microphone access, and use HTTPS when testing outside localhost.

## Security

- Keep `.env.local` private.
- Rotate any credential that has been exposed.
- Use a strong, randomly generated `JWT_SECRET`.
- Do not use development secrets in production.
- Restrict and rotate Google API keys through Google AI Studio.

## License

This project is provided as-is. Add a project-specific license before distributing it publicly.
