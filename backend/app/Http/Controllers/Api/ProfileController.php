<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\Skill;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Certification;
use App\Models\UserSetting;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'profile',
            'educations',
            'experiences',
            'skills',
            'projects',
            'certifications',
            'settings'
        ]);

        return response()->json(['data' => $user]);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'full_name' => 'nullable|string|max:255',
            'professional_headline' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'career_goal' => 'nullable|string',
            'target_roles' => 'nullable|array',
            'professional_summary' => 'nullable|string',
            'languages' => 'nullable|array',
        ]);

        $profile = Profile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        if (isset($validated['full_name'])) {
            $user->update(['name' => $validated['full_name']]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'profile' => $profile
        ]);
    }

    public function addSkill(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:technical,soft,language,domain',
            'proficiency_level' => 'required|string|in:beginner,intermediate,advanced,expert',
            'years_of_experience' => 'required|integer|min:0|max:50',
        ]);

        $skill = $request->user()->skills()->create($validated);

        return response()->json([
            'message' => 'Skill added successfully',
            'skill' => $skill
        ], 201);
    }

    public function deleteSkill(Request $request, $id)
    {
        $skill = $request->user()->skills()->findOrFail($id);
        $skill->delete();

        return response()->json(['message' => 'Skill deleted successfully']);
    }

    public function addEducation(Request $request)
    {
        $validated = $request->validate([
            'institution' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'start_date' => 'nullable|string',
            'end_date' => 'nullable|string',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $education = $request->user()->educations()->create($validated);

        return response()->json([
            'message' => 'Education added successfully',
            'education' => $education
        ], 201);
    }

    public function deleteEducation(Request $request, $id)
    {
        $education = $request->user()->educations()->findOrFail($id);
        $education->delete();

        return response()->json(['message' => 'Education deleted successfully']);
    }

    public function addExperience(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'type' => 'required|string',
            'start_date' => 'nullable|string',
            'end_date' => 'nullable|string',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'technologies' => 'nullable|array',
        ]);

        $experience = $request->user()->experiences()->create($validated);

        return response()->json([
            'message' => 'Experience added successfully',
            'experience' => $experience
        ], 201);
    }

    public function deleteExperience(Request $request, $id)
    {
        $experience = $request->user()->experiences()->findOrFail($id);
        $experience->delete();

        return response()->json(['message' => 'Experience deleted successfully']);
    }

    public function addProject(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'role' => 'nullable|string|max:255',
            'technologies' => 'nullable|array',
            'url' => 'nullable|string|max:255',
            'key_achievements' => 'nullable|array',
        ]);

        $project = $request->user()->projects()->create($validated);

        return response()->json([
            'message' => 'Project added successfully',
            'project' => $project
        ], 201);
    }

    public function deleteProject(Request $request, $id)
    {
        $project = $request->user()->projects()->findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    public function getSettings(Request $request)
    {
        $settings = UserSetting::firstOrCreate(
            ['user_id' => $request->user()->id]
        );

        return response()->json(['data' => $settings]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'memory_enabled' => 'boolean',
            'voice_enabled' => 'boolean',
            'immediate_feedback' => 'boolean',
            'preferred_ai_model' => 'string|max:100',
            'preferred_language' => 'nullable|string|in:en,am',
            'dark_mode' => 'boolean',
        ]);

        $settings = UserSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ]);
    }
}
