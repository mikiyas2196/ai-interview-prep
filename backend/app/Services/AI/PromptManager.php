<?php

namespace App\Services\AI;

class PromptManager
{
    private static function getLanguageInstruction(array $context): string
    {
        $lang = $context['language'] ?? $context['preferred_language'] ?? 'en';
        if ($lang === 'am') {
            return "\nIMPORTANT OUTPUT LANGUAGE REQUIREMENT: Write all generated natural language responses, questions, notes, coaching feedback, strengths, weaknesses, and plan descriptions in Amharic (አማርኛ). Technical term names (e.g. React, SQL, API) may remain in standard form where helpful.\n";
        }
        return "";
    }

    public static function getJobAnalysisPrompt(string $jobDescription): string
    {
        return <<<PROMPT
You are an expert technical recruiter and HR specialist.
Analyze the following job vacancy text and return a structured JSON response with exact keys:
- "job_title": string
- "company": string
- "required_skills": array of strings
- "preferred_skills": array of strings
- "responsibilities": array of strings
- "technical_requirements": array of strings
- "soft_skills": array of strings
- "experience_level": string
- "education_requirements": string
- "key_topics": array of strings

JOB VACANCY TEXT:
{$jobDescription}

Return ONLY valid raw JSON without markdown formatting or code blocks.
PROMPT;
    }

    public static function getCandidateResumeAnalysisPrompt(string $resumeText): string
    {
        return <<<PROMPT
You are an expert AI career consultant.
Extract structured profile details from the following candidate resume text into a raw JSON object with keys:
- "full_name": string
- "professional_headline": string
- "summary": string
- "skills": array of objects with keys ("name", "category", "proficiency_level", "years_of_experience")
- "education": array of objects with keys ("institution", "degree", "field_of_study", "start_date", "end_date", "description")
- "experience": array of objects with keys ("company", "title", "location", "type", "start_date", "end_date", "description", "technologies")
- "projects": array of objects with keys ("title", "description", "role", "technologies", "key_achievements")

RESUME TEXT:
{$resumeText}

Return ONLY valid raw JSON without markdown formatting.
PROMPT;
    }

    public static function getQuestionGenerationPrompt(array $context): string
    {
        $jobTitle = $context['job_title'] ?? 'Software Engineer';
        $category = $context['category'] ?? 'Technical';
        $difficulty = $context['difficulty'] ?? 'intermediate';
        $skills = implode(', ', $context['skills'] ?? []);
        $memories = json_encode($context['memories'] ?? []);
        $count = $context['count'] ?? 3;
        $langInstruction = self::getLanguageInstruction($context);

        return <<<PROMPT
You are a senior hiring manager conducting a realistic mock interview for a candidate applying for the position of: "{$jobTitle}".
Category: {$category}
Target Difficulty: {$difficulty}
Candidate Technical Skills: {$skills}
{$langInstruction}

RETRIEVED CANDIDATE MEMORIES & PAST PERFORMANCE (USE TO PERSONALIZE):
{$memories}

Generate {$count} distinct, realistic, high-quality interview questions.
If the candidate has previous weaknesses in database design, STAR formatting, or conciseness, craft questions that target those weak areas for improvement.

Return a JSON array of objects with keys:
- "id": string (unique slug)
- "category": string
- "question_text": string
- "context_note": string (explaining why this question was selected based on candidate background/memory)
- "ideal_answer_points": array of strings
- "difficulty": string

Return ONLY valid JSON without markdown formatting.
PROMPT;
    }

    public static function getFollowUpPrompt(array $context): string
    {
        $question = $context['question_text'] ?? '';
        $answer = $context['answer_text'] ?? '';
        $langInstruction = self::getLanguageInstruction($context);

        return <<<PROMPT
You are an expert interviewer.
Previous Question: "{$question}"
Candidate Answer: "{$answer}"
{$langInstruction}

Based on the candidate's answer, generate a natural, probing follow-up question that drills deeper into technical details, personal contributions, or missing STAR results.

Return a JSON object with keys:
- "is_needed": boolean
- "follow_up_question": string
- "reason": string

Return ONLY valid JSON.
PROMPT;
    }

    public static function getAnswerEvaluationPrompt(array $context): string
    {
        $question = $context['question_text'] ?? '';
        $answer = $context['answer_text'] ?? '';
        $category = $context['category'] ?? 'Technical';
        $langInstruction = self::getLanguageInstruction($context);

        return <<<PROMPT
You are a rigorous interview coach evaluating a candidate's answer.
Question Category: {$category}
Question: "{$question}"
Candidate Answer: "{$answer}"
{$langInstruction}

Evaluate the answer using realistic standards.
Return a raw JSON object with keys:
- "overall_score": float (0.0 to 10.0)
- "technical_accuracy": float (0.0 to 10.0)
- "clarity_structure": float (0.0 to 10.0)
- "relevance": float (0.0 to 10.0)
- "conciseness": float (0.0 to 10.0)
- "star_format_score": float or null (for behavioral answers)
- "strengths": array of strings
- "weaknesses": array of strings
- "coaching_feedback": string (actionable feedback)
- "recommended_practice": array of strings
- "memory_candidates": array of objects with keys ("type", "topic", "description", "sentiment", "confidence")

Return ONLY valid raw JSON.
PROMPT;
    }

    public static function getPreparationPlanPrompt(array $context): string
    {
        $jobTitle = $context['job_title'] ?? 'Software Engineer';
        $candidateSkills = implode(', ', $context['candidate_skills'] ?? []);
        $requiredSkills = implode(', ', $context['required_skills'] ?? []);
        $weaknesses = implode(', ', $context['weaknesses'] ?? []);
        $langInstruction = self::getLanguageInstruction($context);

        return <<<PROMPT
Create a personalized 7-day interview preparation plan for a candidate applying for "{$jobTitle}".
Candidate Current Skills: {$candidateSkills}
Required Job Skills: {$requiredSkills}
Identified Candidate Weaknesses to Target: {$weaknesses}
{$langInstruction}

Return a JSON array of 7 day objects with keys:
- "day_number": integer
- "title": string
- "focus_area": string
- "description": string
- "recommended_tasks": array of strings
- "target_skills": array of strings

Return ONLY valid raw JSON.
PROMPT;
    }
}
