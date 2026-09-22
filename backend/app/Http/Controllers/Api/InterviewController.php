<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InterviewSession;
use App\Models\InterviewQuestion;
use App\Services\AI\InterviewAIService;
use App\Services\AI\AnswerEvaluationService;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    protected InterviewAIService $interviewAIService;
    protected AnswerEvaluationService $evaluationService;

    public function __construct(
        InterviewAIService $interviewAIService,
        AnswerEvaluationService $evaluationService
    ) {
        $this->interviewAIService = $interviewAIService;
        $this->evaluationService = $evaluationService;
    }

    public function index(Request $request)
    {
        $sessions = $request->user()->interviewSessions()
            ->with(['questions.answer.evaluation', 'jobPosting'])
            ->latest()
            ->get();

        return response()->json(['data' => $sessions]);
    }

    public function startSession(Request $request)
    {
        $validated = $request->validate([
            'job_posting_id' => 'nullable|exists:job_postings,id',
            'category' => 'nullable|string',
            'mode' => 'nullable|string|in:practice,mock',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced',
        ]);

        $session = $this->interviewAIService->startSession(
            $request->user(),
            $validated['job_posting_id'] ?? null,
            $validated['category'] ?? 'Technical',
            $validated['mode'] ?? 'mock',
            $validated['difficulty'] ?? 'intermediate'
        );

        return response()->json([
            'message' => 'Interview session started',
            'data' => $session
        ], 201);
    }

    public function showSession(Request $request, $id)
    {
        $session = $request->user()->interviewSessions()
            ->with(['questions.answer.evaluation', 'jobPosting'])
            ->findOrFail($id);

        return response()->json(['data' => $session]);
    }

    public function submitAnswer(Request $request, $sessionId, $questionId)
    {
        $validated = $request->validate([
            'answer_text' => 'required|string|min:3',
        ]);

        $session = $request->user()->interviewSessions()->findOrFail($sessionId);
        $question = $session->questions()->findOrFail($questionId);

        $answer = $this->interviewAIService->submitAnswer($question, $validated['answer_text']);

        // Immediately evaluate if in practice mode or if user has immediate_feedback enabled
        if ($session->mode === 'practice' || $request->user()->settings?->immediate_feedback) {
            $this->evaluationService->evaluateAnswer($answer);
        }

        return response()->json([
            'message' => 'Answer submitted successfully',
            'data' => $answer->load(['question', 'evaluation'])
        ]);
    }

    public function submitFollowUp(Request $request, $sessionId, $questionId)
    {
        $validated = $request->validate([
            'follow_up_answer' => 'required|string|min:3',
        ]);

        $session = $request->user()->interviewSessions()->findOrFail($sessionId);
        $question = $session->questions()->findOrFail($questionId);

        $answer = $question->answer;
        if ($answer) {
            $answer->follow_up_answer = $validated['follow_up_answer'];
            $answer->save();

            if ($session->mode === 'practice' || $request->user()->settings?->immediate_feedback) {
                $this->evaluationService->evaluateAnswer($answer);
            }
        }

        return response()->json([
            'message' => 'Follow-up answer submitted successfully',
            'data' => $answer->load('evaluation')
        ]);
    }

    public function completeSession(Request $request, $id)
    {
        $session = $request->user()->interviewSessions()->findOrFail($id);
        $report = $this->evaluationService->generateReport($session);

        return response()->json([
            'message' => 'Interview session completed!',
            'session' => $session->load(['questions.answer.evaluation']),
            'report' => $report,
        ]);
    }

    public function getReport(Request $request, $id)
    {
        $session = $request->user()->interviewSessions()
            ->with(['questions.answer.evaluation', 'jobPosting'])
            ->findOrFail($id);

        $report = $this->evaluationService->generateReport($session);

        return response()->json([
            'session' => $session,
            'report' => $report,
        ]);
    }
}
