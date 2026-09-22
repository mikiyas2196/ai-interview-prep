<?php

namespace App\Services\AI;

use App\Models\User;
use App\Models\InterviewSession;
use App\Models\CandidateMemory;
use App\Models\CandidateStrength;
use App\Models\CandidateWeakness;

class MemoryAIService
{
    protected AIServiceInterface $aiService;

    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    public function extractAndSaveMemoriesFromSession(InterviewSession $session): array
    {
        $user = $session->user;
        if (!$user->settings || !$user->settings->memory_enabled) {
            return [];
        }

        $context = [
            'session_title' => $session->title,
            'category' => $session->category,
        ];

        $extractedMemories = $this->aiService->extractMemories($context);

        $savedMemories = [];
        foreach ($extractedMemories as $memData) {
            $memory = CandidateMemory::create([
                'user_id' => $user->id,
                'source_interview_session_id' => $session->id,
                'type' => $memData['type'] ?? 'long_term_learning',
                'topic' => $memData['topic'] ?? 'Interview Topic',
                'description' => $memData['description'] ?? '',
                'sentiment' => $memData['sentiment'] ?? 'weakness',
                'confidence' => $memData['confidence'] ?? 0.85,
                'is_active' => true,
            ]);

            $savedMemories[] = $memory;

            // Update Strengths / Weaknesses tracking tables
            if ($memData['sentiment'] === 'weakness') {
                $weakness = CandidateWeakness::firstOrNew(['user_id' => $user->id, 'topic' => $memData['topic']]);
                $weakness->occurrence_count = ($weakness->occurrence_count ?? 0) + 1;
                $weakness->score = 5.5;
                $weakness->save();
            } else {
                $strength = CandidateStrength::firstOrNew(['user_id' => $user->id, 'topic' => $memData['topic']]);
                $strength->occurrence_count = ($strength->occurrence_count ?? 0) + 1;
                $strength->score = 8.5;
                $strength->save();
            }
        }

        return $savedMemories;
    }

    public function getRelevantMemoriesForUser(User $user): array
    {
        if (!$user->settings || !$user->settings->memory_enabled) {
            return [];
        }

        $memories = $user->memories()
            ->where('is_active', true)
            ->latest()
            ->take(10)
            ->get();

        $weaknesses = $user->candidateWeaknesses()
            ->orderByDesc('occurrence_count')
            ->pluck('topic')
            ->toArray();

        $strengths = $user->candidateStrengths()
            ->orderByDesc('occurrence_count')
            ->pluck('topic')
            ->toArray();

        return [
            'recent_memories' => $memories->toArray(),
            'weaknesses' => $weaknesses,
            'strengths' => $strengths,
        ];
    }
}
