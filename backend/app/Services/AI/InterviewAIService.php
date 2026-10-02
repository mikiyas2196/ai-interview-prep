<?php

namespace App\Services\AI;

use App\Models\User;
use App\Models\JobPosting;
use App\Models\InterviewSession;
use App\Models\InterviewQuestion;
use App\Models\InterviewAnswer;

class InterviewAIService
{
    protected AIServiceInterface $aiService;

    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    public function checkEligibility(User $user): array
    {
        $hasProfile = $user->profile()->exists() && (
            !empty(trim($user->profile->full_name ?? '')) ||
            !empty(trim($user->profile->professional_headline ?? '')) ||
            !empty(trim($user->profile->professional_summary ?? '')) ||
            $user->skills()->count() > 0
        );

        $hasTargetJob = $user->jobPostings()->count() > 0;

        $canStart = $hasProfile && $hasTargetJob;

        $missing = [];
        if (!$hasProfile) {
            $missing[] = 'Candidate Profile';
        }
        if (!$hasTargetJob) {
            $missing[] = 'Target Job Vacancy';
        }

        $message = $canStart
            ? 'User is eligible for AI interview question generation.'
            : 'Candidate Profile and Target Job Required: You must complete your Candidate Profile and insert a Target Job before getting interview questions. Missing: ' . implode(' and ', $missing) . '.';

        return [
            'can_start' => $canStart,
            'has_profile' => $hasProfile,
            'has_target_job' => $hasTargetJob,
            'message' => $message,
        ];
    }

    public function startSession(
        User $user,
        ?int $jobPostingId = null,
        string $category = 'Technical',
        string $mode = 'mock',
        string $difficulty = 'intermediate'
    ): InterviewSession {
        $eligibility = $this->checkEligibility($user);
        if (!$eligibility['can_start']) {
            throw new \InvalidArgumentException($eligibility['message']);
        }

        $jobPosting = $jobPostingId ? JobPosting::find($jobPostingId) : $user->jobPostings()->latest()->first();

        // Determine job title from job posting or candidate profile target role / headline / career goal
        $jobTitle = $jobPosting ? $jobPosting->job_title : (
            is_array($user->profile?->target_roles) && count($user->profile->target_roles) > 0
                ? $user->profile->target_roles[0]
                : ($user->profile?->professional_headline ?: ($user->profile?->career_goal ?: 'Customer Service Officer'))
        );

        $skills = array_map(fn($s) => $s['name'], $user->skills->toArray());

        $session = InterviewSession::create([
            'user_id' => $user->id,
            'job_posting_id' => $jobPosting?->id,
            'title' => "{$category} {$mode} Session ({$jobTitle})",
            'mode' => $mode,
            'category' => $category,
            'difficulty' => $difficulty,
            'status' => 'in_progress',
        ]);

        // Build memories dynamically from user's recorded candidate memories
        $userMemories = $user->memories ? $user->memories->take(5)->pluck('description')->toArray() : [];

        // Collect all previously asked question texts for this user across past sessions to guarantee non-repeating questions
        $previousQuestions = InterviewQuestion::whereHas('session', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->pluck('question_text')->filter()->unique()->values()->toArray();

        // Build context for AI question generation
        $context = [
            'job_title' => $jobTitle,
            'category' => $category,
            'difficulty' => $difficulty,
            'skills' => $skills,
            'memories' => [
                'weaknesses' => ['STAR format result delivery'],
                'strengths' => $skills ? array_slice($skills, 0, 3) : ['Communication', 'Domain Expertise'],
                'notes' => $userMemories
            ],
            'previous_questions' => $previousQuestions,
            'count' => 10,
        ];

        $questionsData = $this->aiService->generateQuestions($context);

        foreach ($questionsData as $index => $qData) {
            InterviewQuestion::create([
                'interview_session_id' => $session->id,
                'question_number' => $index + 1,
                'category' => $qData['category'] ?? $category,
                'question_text' => $qData['question_text'],
                'context_note' => $qData['context_note'] ?? '',
                'ideal_answer_points' => $qData['ideal_answer_points'] ?? [],
                'difficulty' => $qData['difficulty'] ?? $difficulty,
            ]);
        }

        return $session->load(['questions.answer']);
    }

    public function submitAnswer(InterviewQuestion $question, string $answerText): InterviewAnswer
    {
        // Generate dynamic follow up
        $followUp = $this->aiService->generateFollowUpQuestion([
            'question_text' => $question->question_text,
            'answer_text' => $answerText,
        ]);

        $answer = InterviewAnswer::updateOrCreate(
            ['interview_question_id' => $question->id],
            [
                'answer_text' => $answerText,
                'follow_up_question' => ($followUp['is_needed'] ?? false) ? ($followUp['follow_up_question'] ?? null) : null,
            ]
        );

        return $answer;
    }

    public function chatWithAI(array $context): string
    {
        return $this->aiService->chatWithAI($context);
    }
}
