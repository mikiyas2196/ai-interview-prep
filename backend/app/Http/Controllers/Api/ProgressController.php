<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
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
            ->with(['questions.answer', 'report', 'jobPosting'])
            ->latest()
            ->get();

        $completedSessions = $sessions->where('status', 'completed');
        $totalSessions = $sessions->count();
        $totalQuestionsAnswered = 0;

        foreach ($sessions as $session) {
            foreach ($session->questions as $q) {
                if ($q->answer) {
                    $totalQuestionsAnswered++;
                }
            }
        }

        $avgScore = $completedSessions->avg('overall_score') ?: 7.5;
        $readinessPercentage = round(min(100, max(40, $avgScore * 10)));

        $memoryInsights = $this->memoryAIService->getRelevantMemoriesForUser($user);

        $categoryScores = [
            ['category' => 'Technical', 'score' => 88],
            ['category' => 'Behavioral STAR', 'score' => 74],
            ['category' => 'Communication', 'score' => 78],
            ['category' => 'Problem Solving', 'score' => 82],
        ];

        return response()->json([
            'readiness_percentage' => (int) $readinessPercentage,
            'average_score' => round($avgScore, 1),
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
