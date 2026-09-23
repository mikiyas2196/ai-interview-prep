<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use App\Models\InterviewAnswer;
use App\Services\AI\MemoryAIService;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    protected MemoryAIService $memoryAIService;

    public function __construct(MemoryAIService $memoryAIService)
    {
        $this->memoryAIService = $memoryAIService;
    }

    public function getOverview(Request $request)
    {
        $user = $request->user();

        $sessions = $user->interviewSessions()
            ->with(['questions.answer.evaluation', 'report', 'jobPosting'])
            ->latest()
            ->get();

        $completedSessions = $sessions->where('status', 'completed');
        $totalSessions = $sessions->count();
        $totalQuestionsAnswered = 0;

        $evaluations = [];
        foreach ($sessions as $session) {
            foreach ($session->questions as $q) {
                if ($q->answer) {
                    $totalQuestionsAnswered++;
                    if ($q->answer->evaluation) {
                        $evaluations[] = [
                            'category' => $q->category,
                            'eval' => $q->answer->evaluation,
                        ];
                    }
                }
            }
        }

        $hasEvaluations = count($evaluations) > 0;
        $hasCompletedSessions = $completedSessions->count() > 0;
        $hasTargetJob = $user->jobPostings()->exists();
        $hasProfileDetails = $user->profile && (!empty($user->profile->professional_headline) || !empty($user->profile->career_goal));

        if (!$hasEvaluations && !$hasCompletedSessions) {
            // Realistic initial state for new candidates
            $avgScore = 0.0;
            $readinessPercentage = 0;
            if ($hasTargetJob) $readinessPercentage += 15;
            if ($hasProfileDetails) $readinessPercentage += 15;

            $categoryScores = [
                ['category' => 'Technical', 'score' => 0],
                ['category' => 'Behavioral STAR', 'score' => 0],
                ['category' => 'Communication', 'score' => 0],
                ['category' => 'Problem Solving', 'score' => 0],
            ];
        } else {
            // Dynamically calculated real candidate metrics
            $rawAvgScore = $hasCompletedSessions
                ? $completedSessions->avg('overall_score')
                : (count($evaluations) > 0 ? collect($evaluations)->pluck('eval.overall_score')->avg() : 0);

            $avgScore = round($rawAvgScore, 1);

            // Compute readiness from base profile + answer performance + session completion
            $baseReadiness = 10;
            if ($hasTargetJob) $baseReadiness += 15;
            if ($hasProfileDetails) $baseReadiness += 15;

            $scoreComponent = ($avgScore / 10.0) * 60;
            $readinessPercentage = (int) round(min(100, $baseReadiness + $scoreComponent));

            // Compute dynamic category scores (scaled to 100)
            $techEvals = collect($evaluations)->filter(fn($e) => str_contains(strtolower($e['category']), 'tech'));
            $behavioralEvals = collect($evaluations)->filter(fn($e) => str_contains(strtolower($e['category']), 'behavi') || str_contains(strtolower($e['category']), 'star'));
            $commEvals = collect($evaluations)->filter(fn($e) => str_contains(strtolower($e['category']), 'comm'));
            $problemEvals = collect($evaluations)->filter(fn($e) => str_contains(strtolower($e['category']), 'problem') || str_contains(strtolower($e['category']), 'code') || str_contains(strtolower($e['category']), 'system'));

            $calcCategoryScore = function ($collection, $defaultField = 'technical_accuracy') use ($evaluations) {
                if ($collection->count() > 0) {
                    return (int) round($collection->pluck("eval.{$defaultField}")->avg() * 10);
                }
                if (count($evaluations) > 0) {
                    return (int) round(collect($evaluations)->pluck("eval.{$defaultField}")->avg() * 10);
                }
                return 0;
            };

            $categoryScores = [
                ['category' => 'Technical', 'score' => $calcCategoryScore($techEvals, 'technical_accuracy')],
                ['category' => 'Behavioral STAR', 'score' => $calcCategoryScore($behavioralEvals, 'star_format_score')],
                ['category' => 'Communication', 'score' => $calcCategoryScore($commEvals, 'clarity_structure')],
                ['category' => 'Problem Solving', 'score' => $calcCategoryScore($problemEvals, 'relevance')],
            ];
        }

        $memoryInsights = $this->memoryAIService->getRelevantMemoriesForUser($user);

        return response()->json([
            'readiness_percentage' => (int) $readinessPercentage,
            'average_score' => $avgScore,
            'total_sessions' => $totalSessions,
            'completed_sessions' => $completedSessions->count(),
            'total_questions_answered' => $totalQuestionsAnswered,
            'category_scores' => $categoryScores,
            'recent_sessions' => $sessions->take(5)->values(),
            'memory_insights' => $memoryInsights,
            'target_job' => $user->jobPostings()->latest()->first()?->load('requirements'),
        ]);
    }
}
