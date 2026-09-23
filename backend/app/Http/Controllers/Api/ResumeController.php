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
            'resume' => 'required|file|mimes:pdf,docx,txt|max:5120', // Max 5MB
        ]);

        $file = $request->file('resume');
        $path = $file->store('resumes', 'public');

        $text = '';
        if ($file->getClientOriginalExtension() === 'txt') {
            $text = file_get_contents($file->getRealPath());
        } else {
            // For PDF / DOCX, extract readable text or derive candidate background
            $rawFileContent = @file_get_contents($file->getRealPath());
            $sanitizedText = preg_replace('/[^\x20-\x7E\x0A\x0D]/', ' ', substr((string)$rawFileContent, 0, 5000));
            $userRole = $request->user()->profile?->professional_headline ?: 'Customer Service Officer';
            $text = "Resume Document: " . $file->getClientOriginalName() . "\nTarget Position: " . $userRole . "\n" . trim($sanitizedText);
        }

        $resume = $request->user()->resumes()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientOriginalExtension(),
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

        // Apply summary & headline
        if (!empty($data['full_name'])) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $data['full_name'],
                    'professional_headline' => $data['professional_headline'] ?? $user->profile?->professional_headline,
                    'professional_summary' => $data['summary'] ?? $user->profile?->professional_summary,
                ]
            );
        }

        // Populate skills without duplicate names
        if (!empty($data['skills']) && is_array($data['skills'])) {
            foreach ($data['skills'] as $skill) {
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

        // Populate experiences
        if (!empty($data['experience']) && is_array($data['experience'])) {
            foreach ($data['experience'] as $exp) {
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

        // Populate projects
        if (!empty($data['projects']) && is_array($data['projects'])) {
            foreach ($data['projects'] as $proj) {
                $user->projects()->firstOrCreate(
                    ['title' => $proj['title']],
                    [
                        'description' => $proj['description'] ?? '',
                        'role' => $proj['role'] ?? 'Software Developer',
                        'technologies' => $proj['technologies'] ?? [],
                        'key_achievements' => $proj['key_achievements'] ?? [],
                    ]
                );
            }
        }

        return response()->json([
            'message' => 'Candidate profile populated with extracted CV details successfully!',
            'user' => $user->load(['profile', 'skills', 'experiences', 'projects', 'educations'])
        ]);
    }
}
