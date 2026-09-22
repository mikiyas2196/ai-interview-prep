<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class Phase1AuthAndProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Developer',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
        $this->assertDatabaseHas('profiles', ['full_name' => 'John Developer']);
    }

    public function test_user_can_login()
    {
        $user = User::factory()->create([
            'email' => 'login_test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login_test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'token']);
    }

    public function test_authenticated_user_can_manage_profile_and_skills()
    {
        $user = User::factory()->create();
        $user->profile()->create(['full_name' => $user->name]);

        $token = $user->createToken('test_token')->plainTextToken;

        // Add Skill
        $skillResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/profile/skills', [
                'name' => 'Laravel 12',
                'category' => 'technical',
                'proficiency_level' => 'expert',
                'years_of_experience' => 4,
            ]);

        $skillResponse->assertStatus(201);
        $this->assertDatabaseHas('skills', ['name' => 'Laravel 12', 'user_id' => $user->id]);

        // Get Profile
        $profileResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/profile');

        $profileResponse->assertStatus(200)
            ->assertJsonPath('data.skills.0.name', 'Laravel 12');
    }
}
