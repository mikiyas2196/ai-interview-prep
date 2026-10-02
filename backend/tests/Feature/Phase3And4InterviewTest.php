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

    public function test_new_user_without_profile_or_target_job_is_blocked_from_getting_interview_questions()
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        // Try starting session without profile or target job
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/interviews/start', [
                'category' => 'Technical',
                'mode' => 'mock',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('error_code', 'PROFILE_OR_JOB_REQUIRED')
            ->assertJsonPath('has_profile', false)
            ->assertJsonPath('has_target_job', false);
    }

    public function test_candidate_with_profile_and_target_job_gets_10_different_interview_questions_on_subsequent_tries()
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'full_name' => 'Alex Rivera',
            'professional_headline' => 'Senior Customer Service Specialist',
            'target_roles' => ['Customer Service Officer', 'Bank Teller'],
        ]);
        $user->skills()->create([
            'name' => 'Customer Relationship Management',
            'category' => 'soft',
            'proficiency_level' => 'expert',
            'years_of_experience' => 4,
        ]);
        $job = $user->jobPostings()->create([
            'job_title' => 'Customer Service Officer',
            'company' => 'National Commercial Bank',
            'raw_description' => 'Assist bank clients with account inquiries and customer service.',
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        // Session 1: Start Interview
        $startResponse1 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/interviews/start', [
                'job_posting_id' => $job->id,
                'category' => 'Scenario',
                'mode' => 'mock',
            ]);

        $startResponse1->assertStatus(201)
            ->assertJsonCount(10, 'data.questions');

        $session1Questions = collect($startResponse1->json('data.questions'))->pluck('question_text')->toArray();
        $this->assertCount(10, $session1Questions);

        // Session 2: User tries another time
        $startResponse2 = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/interviews/start', [
                'job_posting_id' => $job->id,
                'category' => 'Scenario',
                'mode' => 'mock',
            ]);

        $startResponse2->assertStatus(201)
            ->assertJsonCount(10, 'data.questions');

        $session2Questions = collect($startResponse2->json('data.questions'))->pluck('question_text')->toArray();
        $this->assertCount(10, $session2Questions);

        // Assert session 2 questions are different from session 1 questions
        $overlap = array_intersect($session1Questions, $session2Questions);
        $this->assertEmpty($overlap, 'Questions should be different when the user tries another time!');

        // Submit answer for Question 1 of session 1
        $sessionId = $startResponse1->json('data.id');
        $questionId = $startResponse1->json('data.questions.0.id');

        $answerResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/interviews/{$sessionId}/questions/{$questionId}/answer", [
                'answer_text' => 'I listen actively, acknowledge the customer concern empathetically, and resolve the account issue in accordance with bank compliance rules.',
            ]);

        $answerResponse->assertStatus(200)
            ->assertJsonStructure(['data' => ['id', 'answer_text']]);

        // Complete Session 1
        $completeResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/interviews/{$sessionId}/complete");

        $completeResponse->assertStatus(200)
            ->assertJsonPath('session.status', 'completed');
    }
}
