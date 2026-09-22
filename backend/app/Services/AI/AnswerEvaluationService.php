<?php

namespace App\Services\AI;

use App\Models\InterviewSession;
use App\Models\InterviewAnswer;
use App\Models\AnswerEvaluation;
use App\Models\InterviewReport;

class AnswerEvaluationService
{
    protected AIServiceInterface $aiService;
    protected MemoryAIService $memoryAIService;

    public function __construct(AIServiceInterface $aiService, MemoryAIService $memoryAIService)
    {
        $this->aiService = $aiService;
        $this->memoryAIService = $memoryAIService;
    }

    public function evaluateAnswer(InterviewAnswer $answer): AnswerEvaluation
    {
        $question = $answer->question;
        $context = [
            'category' => $question->category,
            'question_text' => $question->question_text,
            'answer_text' => $answer->answer_text,
        ];

        $evalData = $this->aiService->evaluateAnswer($context);

        $evaluation = AnswerEvaluation::updateOrCreate(
            ['interview_answer_id' => $answer->id],
            [
                'overall_score' => $evalData['overall_score'] ?? 7.5,
                'technical_accuracy' => $evalData['technical_accuracy'] ?? 7.5,
                'clarity_structure' => $evalData['clarity_structure'] ?? 7.5,
                'relevance' => $evalData['relevance'] ?? 8.0,
                'conciseness' => $evalData['conciseness'] ?? 7.0,
                'star_format_score' => $evalData['star_format_score'] ?? null,
                'strengths' => $evalData['strengths'] ?? [],
                'weaknesses' => $evalData['weaknesses'] ?? [],
                'coaching_feedback' => $evalData['coaching_feedback'] ?? '',
                'recommended_practice' => $evalData['recommended_practice'] ?? [],
                'memory_candidates' => $evalData['memory_candidates'] ?? [],
            ]
        );

        return $evaluation;
    }

    public function generateReport(InterviewSession $session): InterviewReport
    {
        // Evaluate any un-evaluated answers first
        foreach ($session->questions as $question) {
            if ($question->answer && !$question->answer->evaluation) {
                $this->evaluateAnswer($question->answer);
            }
        }

        $session->load('questions.answer.evaluation');

        $totalScore = 0;
        $evaluatedCount = 0;
        foreach ($session->questions as $q) {
            if ($q->answer && $q->answer->evaluation) {
                $totalScore += $q->answer->evaluation->overall_score;
                $evaluatedCount++;
            }
        }

        $avgScore = $evaluatedCount > 0 ? round($totalScore / $evaluatedCount, 1) : 7.5;
        $session->overall_score = $avgScore;
        $session->status = 'completed';
        $session->save();

        $summaryData = $this->aiService->summarizeInterview([
            'session_title' => $session->title,
            'category' => $session->category,
        ]);

        $report = InterviewReport::updateOrCreate(
            ['interview_session_id' => $session->id],
            [
                'overall_score' => $avgScore,
                'readiness_percentage' => $summaryData['readiness_percentage'] ?? round($avgScore * 10),
                'summary' => $summaryData['summary'] ?? 'Interview completed successfully.',
                'strengths' => $summaryData['key_strengths'] ?? [],
                'weaknesses' => $summaryData['key_weaknesses'] ?? [],
                'recommended_next_steps' => $summaryData['recommended_next_steps'] ?? [],
            ]
        );

        // Trigger Long-Term Candidate Memory Extraction Pipeline
        $this->memoryAIService->extractAndSaveMemoriesFromSession($session);

        return $report;
    }
}
