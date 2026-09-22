<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CandidateMemory;
use App\Services\AI\MemoryAIService;
use Illuminate\Http\Request;

class MemoryController extends Controller
{
    protected MemoryAIService $memoryAIService;

    public function __construct(MemoryAIService $memoryAIService)
    {
        $this->memoryAIService = $memoryAIService;
    }

    public function index(Request $request)
    {
        $memories = $request->user()->memories()
            ->latest()
            ->get();

        return response()->json([
            'data' => $memories,
            'summary' => $this->memoryAIService->getRelevantMemoriesForUser($request->user()),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'topic' => 'nullable|string|max:255',
            'description' => 'required|string',
            'sentiment' => 'required|string|in:strength,weakness,preference,fact',
            'is_active' => 'boolean',
        ]);

        $memory = $request->user()->memories()->findOrFail($id);
        $memory->update($validated);

        return response()->json([
            'message' => 'Candidate memory entry updated',
            'data' => $memory
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $memory = $request->user()->memories()->findOrFail($id);
        $memory->delete();

        return response()->json(['message' => 'Candidate memory entry deleted successfully']);
    }

    public function clearAll(Request $request)
    {
        $request->user()->memories()->delete();

        return response()->json(['message' => 'All candidate interview memories cleared successfully']);
    }
}
