<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\PreparationPlanItem;
use App\Services\AI\PreparationPlanService;
use Illuminate\Http\Request;

class PreparationPlanController extends Controller
{
    protected PreparationPlanService $planService;

    public function __construct(PreparationPlanService $planService)
    {
        $this->planService = $planService;
    }

    public function getCurrentPlan(Request $request)
    {
        $plan = $request->user()->preparationPlans()
            ->with('items')
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$plan) {
            // Auto generate if none exists
            $plan = $this->planService->generateForUser($request->user());
        }

        return response()->json(['data' => $plan]);
    }

    public function generatePlan(Request $request)
    {
        $validated = $request->validate([
            'job_id' => 'nullable|exists:job_postings,id',
        ]);

        $jobPosting = isset($validated['job_id']) ? JobPosting::find($validated['job_id']) : null;
        $plan = $this->planService->generateForUser($request->user(), $jobPosting);

        return response()->json([
            'message' => 'Personalized 7-day preparation plan generated!',
            'data' => $plan
        ], 201);
    }

    public function toggleItem(Request $request, $itemId)
    {
        $item = PreparationPlanItem::whereHas('preparationPlan', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->findOrFail($itemId);

        $item->is_completed = !$item->is_completed;
        $item->save();

        return response()->json([
            'message' => 'Plan item updated',
            'data' => $item
        ]);
    }
}
