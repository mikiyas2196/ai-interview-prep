<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\CandidateMemory;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Phase5And6MemoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_interview_completion_triggers_evaluation_and_memory_extraction()
    {
        $user = User::factory()->create();
        $user->profile()->create(['full_name' => 'Memory Candidate']);
        $user->settings()->create(['memory_enabled' => true]);

        $token = $user->createToken('test_token')->plainTextToken;

        // 1. Start Session 1
        $startResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/interviews/start', [
                'category' => 'Technical',
                'mode' => 'mock',
            ]);

        $sessionId = $startResponse->json('data.id');
        $questionId = $startResponse->json('data.questions.0.id');

        // 2. Submit Answer
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/interviews/{$sessionId}/questions/{$questionId}/answer", [
                'answer_text' => 'I struggled with explaining my database indexing and query optimization clearly.',
            ]);

        // 3. Complete Session & Trigger Report + Memory Extraction
        $reportResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/interviews/{$sessionId}/report");

        $reportResponse->assertStatus(200)
            ->assertJsonStructure(['session', 'report']);

        // 4. Verify candidate_memories table was populated by pipeline
        $this->assertDatabaseHas('candidate_memories', [
            'user_id' => $user->id,
            'source_interview_session_id' => $sessionId,
        ]);

        // 5. Verify Candidate Memory List Endpoint
        $memoryListResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/memories');

        $memoryListResponse->assertStatus(200)
            ->assertJsonStructure(['data', 'summary']);

        // 6. Test Memory Customization (Edit & Delete)
        $memoryId = $memoryListResponse->json('data.0.id');

        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/memories/{$memoryId}", [
                'description' => 'Candidate updated memory description manually.',
                'sentiment' => 'weakness',
            ]);

        $updateResponse->assertStatus(200);
        $this->assertDatabaseHas('candidate_memories', [
            'id' => $memoryId,
            'description' => 'Candidate updated memory description manually.',
        ]);

        // 7. Start Session 2 -> Verify Personalized Memory Context Injection
        $session2Response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/interviews/start', [
                'category' => 'Technical',
                'mode' => 'mock',
            ]);

        $session2Response->assertStatus(201);
        $this->assertDatabaseHas('interview_sessions', ['user_id' => $user->id]);
    }
}
