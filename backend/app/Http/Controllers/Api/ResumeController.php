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
        $realPath = $file->getRealPath();

        $text = '';
        $base64Data = null;
        $mimeType = null;
        $extension = strtolower($file->getClientOriginalExtension());

        if ($extension === 'txt') {
            $text = @file_get_contents($realPath);
        } else if ($extension === 'docx') {
            $text = self::extractTextFromDocx($realPath);
        } else if ($extension === 'pdf') {
            $text = self::extractTextFromPdf($realPath);
            $rawBytes = @file_get_contents($realPath);
            if ($rawBytes) {
                $base64Data = base64_encode($rawBytes);
                $mimeType = 'application/pdf';
            }
        }

        $text = "Original File Name: " . $file->getClientOriginalName() . "\n\n" . trim((string)$text);

        $resume = $request->user()->resumes()->create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $extension,
            'extracted_text' => $text,
            'status' => 'processing',
        ]);

        // Call AI Service with text, base64, and mimeType
        $parsedData = $this->aiService->analyzeCandidate($text, $base64Data, $mimeType);

        $resume->update([
            'parsed_data' => $parsedData,
            'status' => 'analyzed',
        ]);

        return response()->json([
            'message' => 'Resume uploaded and analyzed successfully',
            'data' => $resume
        ], 201);
    }

    public static function extractTextFromDocx(string $filePath): string
    {
        if (!class_exists('ZipArchive')) return '';
        $zip = new \ZipArchive();
        $text = '';
        if ($zip->open($filePath) === true) {
            if (($index = $zip->locateName('word/document.xml')) !== false) {
                $xmlData = $zip->getFromIndex($index);
                $dom = new \DOMDocument();
                @$dom->loadXML($xmlData, LIBXML_NOENT | LIBXML_XINCLUDE | LIBXML_NOERROR | LIBXML_NOWARNING);
                $text = strip_tags($dom->saveXML());
            }
            $zip->close();
        }
        return trim($text);
    }

    public static function extractTextFromPdf(string $filePath): string
    {
        $content = @file_get_contents($filePath);
        if (!$content) return '';

        $extractedText = '';

        // Try decompressing FlateDecode streams if zlib is enabled
        if (function_exists('gzuncompress')) {
            preg_match_all('/stream\s*(.*?)\s*endstream/s', $content, $streamMatches);
            foreach ($streamMatches[1] as $stream) {
                $uncompressed = @gzuncompress(trim($stream));
                if (!$uncompressed) {
                    $uncompressed = @gzinflate(trim($stream));
                }
                if ($uncompressed) {
                    if (preg_match_all('/\((.*?)\)\s*T[jJ]/s', $uncompressed, $tMatches)) {
                        foreach ($tMatches[1] as $txt) {
                            $extractedText .= $txt . " ";
                        }
                    }
                }
            }
        }

        // Search for uncompressed BT ... ET text blocks
        if (empty(trim($extractedText))) {
            if (preg_match_all('/BT\s*(.*?)\s*ET/s', $content, $matches)) {
                foreach ($matches[1] as $block) {
                    if (preg_match_all('/\((.*?)\)\s*T[jJ]/s', $block, $tMatches)) {
                        foreach ($tMatches[1] as $txt) {
                            $extractedText .= $txt . " ";
                        }
                    }
                }
            }
        }

        // Fallback: extract clean printable text tokens
        if (empty(trim($extractedText))) {
            preg_match_all('/[a-zA-Z0-9\s\.\,\:\;\-\@\/\+\#\(\)]{3,}/', $content, $cleanMatches);
            $filtered = array_filter($cleanMatches[0] ?? [], function ($str) {
                $trimmed = trim($str);
                if (strlen($trimmed) < 3) return false;
                if (preg_match('/^\d+\s+\d+\s+obj/i', $trimmed)) return false;
                if (str_contains($trimmed, '/Font') || str_contains($trimmed, '/Catalog') || str_contains($trimmed, '/Type')) return false;
                if (str_contains($trimmed, 'endobj') || str_contains($trimmed, 'stream')) return false;
                return true;
            });
            $extractedText = implode("\n", array_slice($filtered, 0, 300));
        }

        return trim($extractedText);
    }

    public function applyToProfile(Request $request, $id)
    {
        $user = $request->user();
        $resume = $user->resumes()->findOrFail($id);
        $data = $resume->parsed_data;

        if (!$data || !is_array($data)) {
            return response()->json(['message' => 'No parsed data available for this resume'], 400);
        }

        // 1. Extract Profile Fields with Flexible Key Normalization
        $fullName = $data['full_name'] ?? $data['name'] ?? $data['candidate_name'] ?? $user->profile?->full_name ?? $user->name;
        $headline = $data['professional_headline'] ?? $data['headline'] ?? $data['title'] ?? $data['current_role'] ?? $data['job_title'] ?? $user->profile?->professional_headline;
        $summary = $data['summary'] ?? $data['professional_summary'] ?? $data['about'] ?? $data['bio'] ?? $data['description'] ?? $user->profile?->professional_summary;
        $location = $data['location'] ?? $data['address'] ?? $data['city'] ?? $user->profile?->location;
        $phone = $data['phone'] ?? $data['phone_number'] ?? $data['contact'] ?? $user->profile?->phone;

        $targetRoles = null;
        if (!empty($data['target_roles'])) {
            $targetRoles = is_array($data['target_roles']) ? $data['target_roles'] : array_map('trim', explode(',', $data['target_roles']));
        } else if (!empty($headline)) {
            $targetRoles = [$headline];
        } else {
            $targetRoles = $user->profile?->target_roles;
        }

        // Update Profile record
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'full_name' => $fullName,
                'professional_headline' => $headline,
                'professional_summary' => $summary,
                'location' => $location,
                'phone' => $phone,
                'target_roles' => $targetRoles,
            ]
        );

        if (!empty($fullName)) {
            $user->update(['name' => $fullName]);
        }

        // 2. Populate Skills (handles arrays of strings OR arrays of objects)
        $skills = $data['skills'] ?? $data['skill_list'] ?? [];
        if (!empty($skills) && is_array($skills)) {
            foreach ($skills as $skill) {
                $skillName = '';
                $category = 'technical';
                $level = 'advanced';
                $yrs = 2;

                if (is_string($skill)) {
                    $skillName = trim($skill);
                } else if (is_array($skill)) {
                    $skillName = trim($skill['name'] ?? $skill['skill'] ?? $skill['skill_name'] ?? $skill['title'] ?? '');
                    $category = $skill['category'] ?? 'technical';
                    $level = $skill['proficiency_level'] ?? $skill['level'] ?? 'advanced';
                    $yrs = $skill['years_of_experience'] ?? $skill['years'] ?? 2;
                }

                if (!empty($skillName)) {
                    $user->skills()->firstOrCreate(
                        ['name' => $skillName],
                        [
                            'category' => $category,
                            'proficiency_level' => $level,
                            'years_of_experience' => (int)$yrs,
                        ]
                    );
                }
            }
        }

        // 3. Populate Experiences (handles flexible keys)
        $experiences = $data['experience'] ?? $data['experiences'] ?? $data['work_history'] ?? $data['employment'] ?? [];
        if (!empty($experiences) && is_array($experiences)) {
            foreach ($experiences as $exp) {
                if (is_array($exp)) {
                    $company = trim($exp['company'] ?? $exp['company_name'] ?? $exp['organization'] ?? $exp['employer'] ?? '');
                    $title = trim($exp['title'] ?? $exp['job_title'] ?? $exp['position'] ?? $exp['role'] ?? '');

                    if (empty($company)) $company = 'Enterprise Partner';
                    if (empty($title)) $title = $headline ?: 'Specialist';

                    $user->experiences()->firstOrCreate(
                        [
                            'company' => $company,
                            'title' => $title
                        ],
                        [
                            'location' => $exp['location'] ?? $exp['city'] ?? 'Remote',
                            'type' => $exp['type'] ?? 'full-time',
                            'start_date' => $exp['start_date'] ?? $exp['start'] ?? '2021-01',
                            'end_date' => $exp['end_date'] ?? $exp['end'] ?? null,
                            'description' => $exp['description'] ?? $exp['details'] ?? $exp['responsibilities'] ?? 'Responsible for system engineering and technical solution execution.',
                            'technologies' => $exp['technologies'] ?? $exp['skills_used'] ?? [],
                        ]
                    );
                }
            }
        }

        // 4. Populate Educations (handles flexible keys)
        $educations = $data['education'] ?? $data['educations'] ?? $data['academic'] ?? [];
        if (!empty($educations) && is_array($educations)) {
            foreach ($educations as $edu) {
                if (is_array($edu)) {
                    $inst = trim($edu['institution'] ?? $edu['school'] ?? $edu['university'] ?? $edu['college'] ?? '');
                    $degree = trim($edu['degree'] ?? $edu['degree_name'] ?? $edu['degree_title'] ?? $edu['qualification'] ?? '');

                    if (empty($inst)) $inst = 'University';
                    if (empty($degree)) $degree = 'Bachelor Degree';

                    $user->educations()->firstOrCreate(
                        [
                            'institution' => $inst,
                            'degree' => $degree,
                        ],
                        [
                            'field_of_study' => $edu['field_of_study'] ?? $edu['field'] ?? $edu['major'] ?? 'General',
                            'start_date' => $edu['start_date'] ?? $edu['start'] ?? '2018-09',
                            'end_date' => $edu['end_date'] ?? $edu['end'] ?? '2022-06',
                            'description' => $edu['description'] ?? 'Completed degree with focus on core domain fundamentals.',
                        ]
                    );
                }
            }
        }

        // 5. Populate Projects (handles flexible keys)
        $projects = $data['projects'] ?? $data['project_list'] ?? [];
        if (!empty($projects) && is_array($projects)) {
            foreach ($projects as $proj) {
                if (is_array($proj)) {
                    $projTitle = trim($proj['title'] ?? $proj['name'] ?? $proj['project_name'] ?? '');
                    if (!empty($projTitle)) {
                        $user->projects()->firstOrCreate(
                            ['title' => $projTitle],
                            [
                                'description' => $proj['description'] ?? $proj['details'] ?? 'Software application project.',
                                'role' => $proj['role'] ?? $proj['your_role'] ?? 'Developer',
                                'technologies' => $proj['technologies'] ?? $proj['tech_stack'] ?? [],
                                'key_achievements' => $proj['key_achievements'] ?? $proj['achievements'] ?? [],
                            ]
                        );
                    }
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
