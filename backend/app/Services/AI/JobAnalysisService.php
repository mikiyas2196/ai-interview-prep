<?php

namespace App\Services\AI;

use App\Models\JobPosting;
use App\Models\JobRequirement;
use App\Models\User;

class JobAnalysisService
{
    protected AIServiceInterface $aiService;

    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    public function analyzeAndStore(JobPosting $jobPosting): JobRequirement
    {
        $analysis = $this->aiService->analyzeJob($jobPosting->raw_description);

        if (!empty($analysis['job_title']) && empty($jobPosting->job_title)) {
            $jobPosting->job_title = $analysis['job_title'];
        }

        if (!empty($analysis['company']) && empty($jobPosting->company)) {
            $jobPosting->company = $analysis['company'];
        }

        $jobPosting->experience_level = $analysis['experience_level'] ?? 'Mid-Level';
        $jobPosting->education_requirements = $analysis['education_requirements'] ?? 'Bachelor Degree';
        $jobPosting->status = 'analyzed';
        $jobPosting->save();

        $requirement = JobRequirement::updateOrCreate(
            ['job_posting_id' => $jobPosting->id],
            [
                'required_skills' => $analysis['required_skills'] ?? [],
                'preferred_skills' => $analysis['preferred_skills'] ?? [],
                'responsibilities' => $analysis['responsibilities'] ?? [],
                'technical_requirements' => $analysis['technical_requirements'] ?? [],
                'soft_skills' => $analysis['soft_skills'] ?? [],
                'key_topics' => $analysis['key_topics'] ?? [],
            ]
        );

        return $requirement;
    }

    public function calculateSkillGap(User $user, JobPosting $jobPosting): array
    {
        $requirements = $jobPosting->requirements;
        if (!$requirements) {
            return [
                'match_percentage' => 0,
                'matching_skills' => [],
                'missing_skills' => [],
            ];
        }

        $candidateSkills = array_map(
            fn($s) => strtolower(trim($s['name'])),
            $user->skills->toArray()
        );

        $requiredSkills = $requirements->required_skills ?? [];
        $matching = [];
        $missing = [];

        foreach ($requiredSkills as $skill) {
            $normalizedSkill = strtolower(trim($skill));
            $found = false;
            foreach ($candidateSkills as $cSkill) {
                if (str_contains($cSkill, $normalizedSkill) || str_contains($normalizedSkill, $cSkill)) {
                    $found = true;
                    break;
                }
            }

            if ($found) {
                $matching[] = $skill;
            } else {
                $missing[] = $skill;
            }
        }

        $total = count($requiredSkills);
        $matchPercentage = $total > 0 ? round((count($matching) / $total) * 100) : 100;

        return [
            'match_percentage' => (int) $matchPercentage,
            'matching_skills' => array_values($matching),
            'missing_skills' => array_values($missing),
            'required_skills_count' => $total,
        ];
    }
}
