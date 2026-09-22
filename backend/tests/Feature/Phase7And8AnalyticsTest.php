<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Phase7And8AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_candidate_can_create_story_and_fetch_progress_overview()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        // 1. Create Story
        $storyResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/stories', [
                'title' => 'Lab Reservation System Architecture',
                'situation' => 'Legacy reservation system caused double bookings during peak hours.',
                'task' => 'Redesign backend API using Laravel 11 and database transactions.',
                'action' => 'Implemented optimistic lock handling and composite database indexes.',
                'result' => 'Eliminated 100% of double bookings and reduced response time by 45%.',
                'tags' => ['Laravel', 'Database Optimization', 'STAR'],
            ]);

        $storyResponse->assertStatus(201)
            ->assertJsonPath('data.title', 'Lab Reservation System Architecture');

        $this->assertDatabaseHas('stories', ['user_id' => $user->id, 'title' => 'Lab Reservation System Architecture']);

        // 2. Fetch Progress Overview Dashboard Endpoint
        $progressResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/progress/overview');

        $progressResponse->assertStatus(200)
            ->assertJsonStructure([
                'readiness_percentage',
                'average_score',
                'total_sessions',
                'category_scores',
                'memory_insights'
            ]);
    }
}
