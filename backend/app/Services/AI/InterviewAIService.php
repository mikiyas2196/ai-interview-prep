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

    public function startSession(
        User $user,
        ?int $jobPostingId = null,
        string $category = 'Technical',
        string $mode = 'mock',
        string $difficulty = 'intermediate'
    ): InterviewSession {
        $jobPosting = $jobPostingId ? JobPosting::find($jobPostingId) : $user->jobPostings()->latest()->first();

        $jobTitle = $jobPosting ? $jobPosting->job_title : ($user->profile?->professional_headline ?? 'Software Engineer');
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

        // Build context for AI question generation
        $context = [
            'job_title' => $jobTitle,
            'category' => $category,
            'difficulty' => $difficulty,
            'skills' => $skills,
            'memories' => [
                'weaknesses' => ['Database architecture explanation', 'STAR format results'],
                'strengths' => ['PHP/Laravel REST API design']
            ],
            'count' => 4,
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
}
