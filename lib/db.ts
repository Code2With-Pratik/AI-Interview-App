import { neon } from '@neondatabase/serverless'
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const sql = neon(process.env.DATABASE_URL!)

export type User = {
  id: number
  email: string
  password_hash: string
  full_name: string
  created_at: string
  updated_at: string
}

export type Resume = {
  id: number
  user_id: number
  content: string
  file_name: string
  created_at: string
}

export type Interview = {
  id: number
  user_id: number
  resume_id: number | null
  job_description: string | null
  manual_input_id: number | null
  status: 'in_progress' | 'completed'
  overall_score: number | null
  started_at: string
  completed_at: string | null
}

export type Question = {
  id: number
  interview_id: number
  question_text: string
  question_order: number
  is_follow_up: boolean
  parent_question_id: number | null
  created_at: string
}

export type Answer = {
  id: number
  question_id: number
  answer_text: string
  feedback: string
  rating: number | null
  created_at: string
}

export type Session = {
  id: number
  user_id: number
  token: string
  expires_at: string
  created_at: string
}

export type ManualInput = {
  id: number
  user_id: number
  languages: string
  skills: string
  experience_level: string
  job_title: string | null
  created_at: string
}

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  ` as User[]
  return result.length > 0 ? result[0] : null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  ` as User[]
  return result.length > 0 ? result[0] : null
}

export async function createUser(email: string, passwordHash: string, fullName: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${email}, ${passwordHash}, ${fullName})
    RETURNING *
  ` as User[]
  return result[0]
}

// Session operations
export async function createSession(userId: string, token: string, expiresAt: string): Promise<Session> {
  const result = await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
    RETURNING *
  ` as Session[]
  return result[0]
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  const result = await sql`
    SELECT * FROM sessions WHERE token = ${token} AND expires_at > NOW()
  ` as Session[]
  return result.length > 0 ? result[0] : null
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE token = ${token}`
}

// Resume operations
export async function createResume(userId: string, content: string, fileName: string): Promise<Resume> {
  const result = await sql`
    INSERT INTO resumes (user_id, content, file_name)
    VALUES (${userId}, ${content}, ${fileName})
    RETURNING *
  ` as Resume[]
  return result[0]
}

export async function getResumesByUserId(userId: string): Promise<Resume[]> {
  return await sql`
    SELECT * FROM resumes WHERE user_id = ${userId} ORDER BY created_at DESC
  ` as Resume[]
}

// Interview operations
export async function createInterview(
  userId: string,
  resumeId: string | null,
  jobDescription: string | null,
  manualInputId: string | null
): Promise<Interview> {
  const result = await sql`
    INSERT INTO interviews (user_id, resume_id, job_description, manual_input_id, status)
    VALUES (${userId}, ${resumeId}, ${jobDescription}, ${manualInputId}, 'in_progress')
    RETURNING *
  ` as Interview[]
  return result[0]
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const result = await sql`
    SELECT * FROM interviews WHERE id = ${id}
  ` as Interview[]
  return result.length > 0 ? result[0] : null
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  return await sql`
    SELECT * FROM interviews WHERE user_id = ${userId} ORDER BY started_at DESC
  ` as Interview[]
}

export async function updateInterviewScore(interviewId: string, score: number): Promise<Interview> {
  const result = await sql`
    UPDATE interviews 
    SET overall_score = ${score}, status = 'completed', completed_at = NOW()
    WHERE id = ${interviewId}
    RETURNING *
  ` as Interview[]
  return result[0]
}

// Question operations
export async function createQuestion(
  interviewId: string,
  questionText: string,
  questionOrder: number,
  isFollowUp: boolean = false,
  parentQuestionId: string | null = null
): Promise<Question> {
  const result = await sql`
    INSERT INTO questions (interview_id, question_text, question_order, is_follow_up, parent_question_id)
    VALUES (${interviewId}, ${questionText}, ${questionOrder}, ${isFollowUp}, ${parentQuestionId})
    RETURNING *
  ` as Question[]
  return result[0]
}

export async function getQuestionsByInterviewId(interviewId: string): Promise<Question[]> {
  return await sql`
    SELECT * FROM questions WHERE interview_id = ${interviewId} ORDER BY question_order ASC
  ` as Question[]
}

// Answer operations
export async function createAnswer(
  questionId: string,
  answerText: string,
  feedback: string,
  rating: number
): Promise<Answer> {
  const result = await sql`
    INSERT INTO answers (question_id, answer_text, feedback, rating)
    VALUES (${questionId}, ${answerText}, ${feedback}, ${rating})
    RETURNING *
  ` as Answer[]
  return result[0]
}

export async function getAnswersByInterviewId(interviewId: string): Promise<Answer[]> {
  return await sql`
    SELECT a.* FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE q.interview_id = ${interviewId}
    ORDER BY a.created_at ASC
  ` as Answer[]
}

// Manual input operations
export async function createManualInput(
  userId: string,
  languages: string[],
  skills: string[],
  experienceLevel: string,
  jobTitle: string | null
): Promise<ManualInput> {
  const result = await sql`
    INSERT INTO manual_inputs (user_id, languages, skills, experience_level, job_title)
    VALUES (${userId}, ${JSON.stringify(languages)}, ${JSON.stringify(skills)}, ${experienceLevel}, ${jobTitle})
    RETURNING *
  ` as ManualInput[]
  return result[0]
}

export async function getManualInputById(id: string): Promise<ManualInput | null> {
  const result = await sql`
    SELECT * FROM manual_inputs WHERE id = ${id}
  ` as ManualInput[]
  return result.length > 0 ? result[0] : null
}
