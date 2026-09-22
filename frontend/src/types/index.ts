export interface User {
  id: number;
  name: string;
  email: string;
  profile?: Profile;
  educations?: Education[];
  experiences?: Experience[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  settings?: UserSettings;
}

export interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  professional_headline?: string;
  location?: string;
  phone?: string;
  profile_photo_url?: string;
  career_goal?: string;
  target_roles?: string[];
  professional_summary?: string;
  languages?: string[];
}

export interface Skill {
  id: number;
  user_id: number;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'domain';
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_of_experience: number;
}

export interface Education {
  id: number;
  user_id: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Experience {
  id: number;
  user_id: number;
  company: string;
  title: string;
  location?: string;
  type: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  technologies?: string[];
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  role?: string;
  technologies?: string[];
  url?: string;
  key_achievements?: string[];
}

export interface Certification {
  id: number;
  user_id: number;
  name: string;
  issuing_organization?: string;
  issue_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface UserSettings {
  id: number;
  user_id: number;
  memory_enabled: boolean;
  voice_enabled: boolean;
  immediate_feedback: boolean;
  preferred_ai_model: string;
  preferred_language?: 'en' | 'am';
  dark_mode: boolean;
}

export interface JobRequirement {
  id: number;
  job_posting_id: number;
  required_skills?: string[];
  preferred_skills?: string[];
  responsibilities?: string[];
  technical_requirements?: string[];
  soft_skills?: string[];
  key_topics?: string[];
}

export interface JobPosting {
  id: number;
  user_id: number;
  job_title: string;
  company?: string;
  location?: string;
  raw_description: string;
  status: 'pending' | 'analyzed' | 'failed';
  experience_level?: string;
  education_requirements?: string;
  requirements?: JobRequirement;
  created_at: string;
}

export interface SkillGap {
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  required_skills_count: number;
}

export interface Resume {
  id: number;
  user_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  extracted_text?: string;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
  parsed_data?: any;
  created_at: string;
}

export interface PreparationPlanItem {
  id: number;
  preparation_plan_id: number;
  day_number: number;
  title: string;
  focus_area: string;
  description?: string;
  recommended_tasks?: string[];
  target_skills?: string[];
  is_completed: boolean;
}

export interface PreparationPlan {
  id: number;
  user_id: number;
  job_posting_id?: number;
  title: string;
  overall_summary?: string;
  status: 'active' | 'completed' | 'archived';
  items?: PreparationPlanItem[];
  created_at: string;
}

export interface AnswerEvaluation {
  id: number;
  interview_answer_id: number;
  overall_score: number;
  technical_accuracy: number;
  clarity_structure: number;
  relevance: number;
  conciseness: number;
  star_format_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  coaching_feedback?: string;
  recommended_practice?: string[];
  memory_candidates?: any[];
}

export interface InterviewAnswer {
  id: number;
  interview_question_id: number;
  answer_text: string;
  follow_up_question?: string;
  follow_up_answer?: string;
  audio_url?: string;
  evaluation?: AnswerEvaluation;
  created_at: string;
}

export interface InterviewQuestion {
  id: number;
  interview_session_id: number;
  question_number: number;
  category: string;
  question_text: string;
  context_note?: string;
  ideal_answer_points?: string[];
  difficulty: string;
  answer?: InterviewAnswer;
}

export interface InterviewReport {
  id: number;
  interview_session_id: number;
  overall_score: number;
  readiness_percentage: number;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommended_next_steps?: string[];
}

export interface InterviewSession {
  id: number;
  user_id: number;
  job_posting_id?: number;
  title: string;
  mode: 'practice' | 'mock';
  category: string;
  difficulty: string;
  status: 'in_progress' | 'completed';
  overall_score?: number;
  questions?: InterviewQuestion[];
  job_posting?: JobPosting;
  report?: InterviewReport;
  created_at: string;
}

export interface CandidateMemory {
  id: number;
  user_id: number;
  source_interview_session_id?: number;
  type: 'permanent_profile' | 'long_term_learning' | 'interview_memory' | 'story_memory';
  topic: string;
  description: string;
  sentiment: 'strength' | 'weakness' | 'preference' | 'fact';
  confidence: number;
  is_active: boolean;
  created_at: string;
}
