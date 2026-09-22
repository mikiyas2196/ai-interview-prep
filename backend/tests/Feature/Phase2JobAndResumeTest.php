<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\JobPosting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class Phase2JobAndResumeTest extends TestCase
{
    use RefreshDatabase;

    public function test_candidate_can_create_and_analyze_job_vacancy()
    {
        $user = User::factory()->create();
        $user->skills()->create([
            'name' => 'Laravel',
            'category' => 'technical',
            'proficiency_level' => 'expert',
            'years_of_experience' => 4,
        ]);

        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/jobs', [
                'job_title' => 'Junior Laravel Developer',
                'company' => 'Innovate Tech',
                'raw_description' => 'We are seeking a Junior Laravel Developer with strong PHP, Laravel, MySQL, and REST API skills. Must have experience with Git and problem solving skills.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.job_title', 'Junior Laravel Developer')
            ->assertJsonPath('data.status', 'analyzed');

        $this->assertDatabaseHas('job_postings', ['job_title' => 'Junior Laravel Developer']);
        $this->assertDatabaseHas('job_requirements', ['job_posting_id' => $response->json('data.id')]);

        // Get Job Details and Skill Gap
        $jobId = $response->json('data.id');
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson("/api/jobs/{$jobId}");

        $showResponse->assertStatus(200)
            ->assertJsonStructure(['data', 'skill_gap']);
    }

    public function test_candidate_can_upload_and_apply_resume()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $file = UploadedFile::fake()->create('candidate_cv.txt', 100, 'text/plain');

        $uploadResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/resumes/upload', [
                'resume' => $file,
            ]);

        $uploadResponse->assertStatus(201)
            ->assertJsonPath('data.status', 'analyzed');

        $resumeId = $uploadResponse->json('data.id');

        // Apply resume to candidate profile
        $applyResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/resumes/{$resumeId}/apply");

        $applyResponse->assertStatus(200);
        $this->assertDatabaseHas('skills', ['user_id' => $user->id]);
    }
}
