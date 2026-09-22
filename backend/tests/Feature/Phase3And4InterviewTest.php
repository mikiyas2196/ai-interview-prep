<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\JobPosting;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Phase3And4InterviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_candidate_can_generate_and_toggle_preparation_plan()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/plans/generate');

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'active')
            ->assertJsonCount(7, 'data.items');

        $itemId = $response->json('data.items.0.id');

        // Toggle item completed
        $toggleResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson("/api/plans/items/{$itemId}/toggle");

        $toggleResponse->assertStatus(200)
            ->assertJsonPath('data.is_completed', true);
    }

    public function test_candidate_can_run_mock_interview_with_answers_and_follow_up()
    {
        $user = User::factory()->create();
        $user->skills()->create([
            'name' => 'Laravel',
            'category' => 'technical',
            'proficiency_level' => 'expert',
            'years_of_experience' => 4,
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        // Start Interview Session
        $startResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/interviews/start', [
                'category' => 'Technical',
                'mode' => 'mock',
                'difficulty' => 'intermediate',
            ]);

        $startResponse->assertStatus(201)
            ->assertJsonPath('data.status', 'in_progress');

        $sessionId = $startResponse->json('data.id');
        $questionId = $startResponse->json('data.questions.0.id');

        // Submit Answer for Question 1
        $answerResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/interviews/{$sessionId}/questions/{$questionId}/answer", [
                'answer_text' => 'I use eager loading with with() to prevent N+1 query performance bottlenecks in Eloquent.',
            ]);

        $answerResponse->assertStatus(200)
            ->assertJsonStructure(['data' => ['id', 'answer_text']]);

        // Complete Session
        $completeResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/interviews/{$sessionId}/complete");

        $completeResponse->assertStatus(200)
            ->assertJsonPath('session.status', 'completed');
    }
}
