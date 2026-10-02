<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resume;
use App\Services\AI\AIServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ResumeController extends Controller
{
    protected AIServiceInterface $aiService;

    public function __construct(AIServiceInterface $aiService)
    {
        $this->aiService = $aiService;
    }

    public function index(Request $request)
    {
        $resumes = $request->user()->resumes()->latest()->get();
        return response()->json(['data' => $resumes]);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'resume' => 'required|file|mimes:pdf,docx,txt|max:10240', // Max 10MB
        ]);

        $file = $request->file('resume');
        $path = $file->store('resumes', 'public');

        $text = '';
        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension === 'txt') {
            $text = file_get_contents($file->getRealPath());
        } else {
            // For PDF / DOCX, extract readable ASCII text streams
            $rawFileContent = @file_get_contents($file->getRealPath());
            preg_match_all('/[\x20-\x7E\x0A\x0D]{3,}/', (string)$rawFileContent, $matches);
            $extractedStrings = implode("\n", array_slice($matches[0] ?? [], 0, 400));

            if (empty(trim($extractedStrings))) {
                $extractedStrings = preg_replace('/[^\x20-\x7E\x0A\x0D]/', ' ', substr((string)$rawFileContent, 0, 5000));
            }

            $userRole = $request->user()->profile?->professional_headline ?: 'Candidate Specialist';
            $text = "Resume Document: " . $file->getClientOriginalName() . "\nCandidate Role: " . $userRole . "\n\nContent:\n" . trim($extractedStrings);
        }

        $resume = $request->user()->resumes()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $extension,
            'extracted_text' => $text,
            'status' => 'processing',
        ]);

        // Call AI Service to parse structured info
        $parsedData = $this->aiService->analyzeCandidate($text);

        $resume->update([
            'parsed_data' => $parsedData,
            'status' => 'analyzed',
        ]);

        return response()->json([
            'message' => 'Resume uploaded and analyzed successfully',
            'data' => $resume
        ], 201);
    }

    public function applyToProfile(Request $request, $id)
    {
        $user = $request->user();
        $resume = $user->resumes()->findOrFail($id);
        $data = $resume->parsed_data;

        if (!$data) {
            return response()->json(['message' => 'No parsed data available for this resume'], 400);
        }

        // Apply summary, headline & general profile fields
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $data['full_name'] ?? $user->profile?->full_name ?? $user->name,
                'professional_headline' => $data['professional_headline'] ?? $user->profile?->professional_headline,
                'professional_summary' => $data['summary'] ?? $user->profile?->professional_summary,
                'location' => $data['location'] ?? $user->profile?->location,
                'phone' => $data['phone'] ?? $user->profile?->phone,
                'target_roles' => !empty($data['target_roles'])
                    ? (is_array($data['target_roles']) ? $data['target_roles'] : array_map('trim', explode(',', $data['target_roles'])))
                    : $user->profile?->target_roles,
            ]
        );

        // Also update User model name if full_name exists
        if (!empty($data['full_name'])) {
            $user->update(['name' => $data['full_name']]);
        }

        // Populate skills without duplicate names
        if (!empty($data['skills']) && is_array($data['skills'])) {
            foreach ($data['skills'] as $skill) {
                if (is_array($skill) && !empty($skill['name'])) {
                    $user->skills()->firstOrCreate(
                        ['name' => $skill['name']],
                        [
                            'category' => $skill['category'] ?? 'technical',
                            'proficiency_level' => $skill['proficiency_level'] ?? 'advanced',
                            'years_of_experience' => $skill['years_of_experience'] ?? 2,
                        ]
                    );
                }
            }
        }

        // Populate experiences
        if (!empty($data['experience']) && is_array($data['experience'])) {
            foreach ($data['experience'] as $exp) {
                if (is_array($exp) && !empty($exp['company']) && !empty($exp['title'])) {
                    $user->experiences()->firstOrCreate(
                        [
                            'company' => $exp['company'],
                            'title' => $exp['title']
                        ],
                        [
                            'location' => $exp['location'] ?? 'Remote',
                            'type' => $exp['type'] ?? 'full-time',
                            'start_date' => $exp['start_date'] ?? null,
                            'end_date' => $exp['end_date'] ?? null,
                            'description' => $exp['description'] ?? '',
                            'technologies' => $exp['technologies'] ?? [],
                        ]
                    );
                }
            }
        }

        // Populate education records
        if (!empty($data['education']) && is_array($data['education'])) {
            foreach ($data['education'] as $edu) {
                if (is_array($edu) && !empty($edu['institution'])) {
                    $user->educations()->firstOrCreate(
                        [
                            'institution' => $edu['institution'],
                            'degree' => $edu['degree'] ?? 'Bachelor Degree',
                        ],
                        [
                            'field_of_study' => $edu['field_of_study'] ?? 'General',
                            'start_date' => $edu['start_date'] ?? null,
                            'end_date' => $edu['end_date'] ?? null,
                            'description' => $edu['description'] ?? '',
                        ]
                    );
                }
            }
        }

        // Populate projects
        if (!empty($data['projects']) && is_array($data['projects'])) {
            foreach ($data['projects'] as $proj) {
                if (is_array($proj) && !empty($proj['title'])) {
                    $user->projects()->firstOrCreate(
                        ['title' => $proj['title']],
                        [
                            'description' => $proj['description'] ?? '',
                            'role' => $proj['role'] ?? 'Specialist',
                            'technologies' => $proj['technologies'] ?? [],
                            'key_achievements' => $proj['key_achievements'] ?? [],
                        ]
                    );
                }
            }
        }

        return response()->json([
            'message' => 'Candidate profile populated with extracted CV details successfully!',
            'user' => $user->load(['profile', 'skills', 'experiences', 'projects', 'educations']),
            'parsed_data' => $data
        ]);
    }

    public function uploadAndApply(Request $request)
    {
        $uploadRes = $this->upload($request);
        if ($uploadRes->getStatusCode() !== 201) {
            return $uploadRes;
        }

        $resumeData = json_decode($uploadRes->getContent(), true);
        if (empty($resumeData['data']['id'])) {
            return response()->json(['message' => 'Failed to parse resume upload response'], 500);
        }

        return $this->applyToProfile($request, $resumeData['data']['id']);
    }
}
