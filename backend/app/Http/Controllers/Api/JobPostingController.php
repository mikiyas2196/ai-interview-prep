<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Services\AI\JobAnalysisService;
use Illuminate\Http\Request;

class JobPostingController extends Controller
{
    protected JobAnalysisService $jobAnalysisService;

    public function __construct(JobAnalysisService $jobAnalysisService)
    {
        $this->jobAnalysisService = $jobAnalysisService;
    }

    public function index(Request $request)
    {
        $jobs = $request->user()->jobPostings()
            ->with('requirements')
            ->latest()
            ->get();

        return response()->json(['data' => $jobs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'raw_description' => 'required|string|min:20',
        ]);

        $jobPosting = $request->user()->jobPostings()->create([
            'job_title' => $validated['job_title'],
            'company' => $validated['company'] ?? 'Target Company',
            'location' => $validated['location'] ?? 'Remote',
            'raw_description' => $validated['raw_description'],
            'status' => 'pending',
        ]);

        // Analyze job using AI
        $this->jobAnalysisService->analyzeAndStore($jobPosting);

        return response()->json([
            'message' => 'Job vacancy created and analyzed successfully',
            'data' => $jobPosting->load('requirements')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $jobPosting = $request->user()->jobPostings()
            ->with('requirements')
            ->findOrFail($id);

        $skillGap = $this->jobAnalysisService->calculateSkillGap($request->user(), $jobPosting);

        return response()->json([
            'data' => $jobPosting,
            'skill_gap' => $skillGap
        ]);
    }

    public function analyze(Request $request, $id)
    {
        $jobPosting = $request->user()->jobPostings()->findOrFail($id);
        $this->jobAnalysisService->analyzeAndStore($jobPosting);

        $skillGap = $this->jobAnalysisService->calculateSkillGap($request->user(), $jobPosting);

        return response()->json([
            'message' => 'Job re-analyzed successfully',
            'data' => $jobPosting->load('requirements'),
            'skill_gap' => $skillGap
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $jobPosting = $request->user()->jobPostings()->findOrFail($id);
        $jobPosting->delete();

        return response()->json(['message' => 'Job vacancy deleted successfully']);
    }
}
