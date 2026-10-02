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
