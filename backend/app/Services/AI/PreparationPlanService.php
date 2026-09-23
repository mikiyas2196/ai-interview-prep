<?php

namespace App\Services\AI;

use App\Models\User;
use App\Models\JobPosting;
use App\Models\PreparationPlan;
use App\Models\PreparationPlanItem;

class PreparationPlanService
{
    protected AIServiceInterface $aiService;

    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    public function generateForUser(User $user, ?JobPosting $jobPosting = null): PreparationPlan
    {
        // Deactivate previous active plans
        $user->preparationPlans()->where('status', 'active')->update(['status' => 'archived']);

        $candidateSkills = array_map(fn($s) => $s['name'], $user->skills->toArray());
        $requiredSkills = $jobPosting && $jobPosting->requirements ? ($jobPosting->requirements->required_skills ?? []) : [];
        $jobTitle = $jobPosting ? $jobPosting->job_title : (
            is_array($user->profile?->target_roles) && count($user->profile->target_roles) > 0
                ? $user->profile->target_roles[0]
                : ($user->profile?->professional_headline ?: ($user->profile?->career_goal ?: 'Customer Service Officer'))
        );

        $context = [
            'job_title' => $jobTitle,
            'candidate_skills' => $candidateSkills,
            'required_skills' => $requiredSkills,
            'weaknesses' => ['STAR answer result delivery', 'Role-specific scenario prep'],
        ];

        $planData = $this->aiService->generatePreparationPlan($context);

        $plan = PreparationPlan::create([
            'user_id' => $user->id,
            'job_posting_id' => $jobPosting?->id,
            'title' => "Personalized 7-Day Plan for {$jobTitle}",
            'overall_summary' => "Customized 7-day preparation schedule targeting your key skill gaps and behavioral STAR answer structure.",
            'status' => 'active',
        ]);

        foreach ($planData as $itemData) {
            PreparationPlanItem::create([
                'preparation_plan_id' => $plan->id,
                'day_number' => $itemData['day_number'] ?? 1,
                'title' => $itemData['title'] ?? 'Daily Prep',
                'focus_area' => $itemData['focus_area'] ?? 'Technical Focus',
                'description' => $itemData['description'] ?? '',
                'recommended_tasks' => $itemData['recommended_tasks'] ?? [],
                'target_skills' => $itemData['target_skills'] ?? [],
                'is_completed' => false,
            ]);
        }

        return $plan->load('items');
    }
}
