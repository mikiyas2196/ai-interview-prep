<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Skill;
use App\Models\Project;
use App\Models\Certification;
use App\Models\UserSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::create([
            'name' => 'Alex Rivera',
            'email' => 'candidate@example.com',
            'password' => Hash::make('password123'),
        ]);

        Profile::create([
            'user_id' => $user->id,
            'full_name' => 'Alex Rivera',
            'professional_headline' => 'Senior Full Stack Software Engineer',
            'location' => 'San Francisco, CA',
            'phone' => '+1 (555) 234-5678',
            'career_goal' => 'Transition to Senior Backend / Lead Software Engineer role at a fast-growing tech company.',
            'target_roles' => ['Senior Laravel Developer', 'Backend Architect', 'Full Stack Engineer'],
            'professional_summary' => 'Experienced software engineer with 4+ years of expertise in building enterprise web applications, REST APIs, and microservices using PHP, Laravel, MySQL, and React.',
            'languages' => ['English (Native)', 'Spanish (Conversational)'],
        ]);

        UserSetting::create([
            'user_id' => $user->id,
            'memory_enabled' => true,
            'voice_enabled' => false,
            'immediate_feedback' => true,
            'preferred_ai_model' => 'gemini-2.5-flash',
            'dark_mode' => false,
        ]);

        Skill::insert([
            [
                'user_id' => $user->id,
                'name' => 'Laravel',
                'category' => 'technical',
                'proficiency_level' => 'expert',
                'years_of_experience' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'name' => 'PHP',
                'category' => 'technical',
                'proficiency_level' => 'expert',
                'years_of_experience' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'name' => 'MySQL',
                'category' => 'technical',
                'proficiency_level' => 'advanced',
                'years_of_experience' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'name' => 'React & Next.js',
                'category' => 'technical',
                'proficiency_level' => 'intermediate',
                'years_of_experience' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $user->id,
                'name' => 'REST API Design',
                'category' => 'technical',
                'proficiency_level' => 'advanced',
                'years_of_experience' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        Education::create([
            'user_id' => $user->id,
            'institution' => 'California State University',
            'degree' => 'Bachelor of Science',
            'field_of_study' => 'Computer Science',
            'start_date' => '2018-09',
            'end_date' => '2022-05',
            'is_current' => false,
            'description' => 'Graduated with Honors. Specialized in Software Engineering and Database Systems.',
        ]);

        Experience::create([
            'user_id' => $user->id,
            'company' => 'Apex Cloud Systems',
            'title' => 'Software Engineer',
            'location' => 'San Francisco, CA',
            'type' => 'full-time',
            'start_date' => '2022-06',
            'end_date' => null,
            'is_current' => true,
            'description' => 'Architected scalable backend REST APIs in Laravel 10/11 serving 100k daily active users. Reduced database query latency by 45% through indexing and caching.',
            'technologies' => json_encode(['Laravel', 'PHP', 'MySQL', 'Redis', 'Docker']),
        ]);

        Project::create([
            'user_id' => $user->id,
            'title' => 'Lab Reservation & Inventory Platform',
            'description' => 'Real-time lab reservation platform built with Laravel Sanctum and React.',
            'role' => 'Lead Backend Engineer',
            'technologies' => json_encode(['Laravel', 'React', 'MySQL', 'Tailwind CSS']),
            'url' => 'https://github.com/demo/lab-reservation',
            'key_achievements' => json_encode(['Prevented concurrent double-bookings', 'Handled 500+ daily student reservations']),
        ]);

        Certification::create([
            'user_id' => $user->id,
            'name' => 'Certified Laravel Developer',
            'issuing_organization' => 'Laravel LLC',
            'issue_date' => '2023-04',
            'credential_id' => 'CLD-98231',
            'credential_url' => 'https://certification.laravel.com/verify/98231',
        ]);
    }
}
