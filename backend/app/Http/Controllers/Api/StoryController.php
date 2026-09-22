<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\Request;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        $stories = $request->user()->stories()
            ->latest()
            ->get();

        return response()->json(['data' => $stories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'situation' => 'nullable|string',
            'task' => 'nullable|string',
            'action' => 'nullable|string',
            'result' => 'nullable|string',
            'lessons_learned' => 'nullable|string',
            'technologies' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        $story = $request->user()->stories()->create($validated);

        if (!empty($validated['tags'])) {
            foreach ($validated['tags'] as $tagName) {
                $story->storyTags()->create(['tag_name' => $tagName]);
            }
        }

        return response()->json([
            'message' => 'Interview story created successfully',
            'data' => $story
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $story = $request->user()->stories()->findOrFail($id);
        return response()->json(['data' => $story]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'situation' => 'nullable|string',
            'task' => 'nullable|string',
            'action' => 'nullable|string',
            'result' => 'nullable|string',
            'lessons_learned' => 'nullable|string',
            'technologies' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        $story = $request->user()->stories()->findOrFail($id);
        $story->update($validated);

        return response()->json([
            'message' => 'Story updated successfully',
            'data' => $story
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $story = $request->user()->stories()->findOrFail($id);
        $story->delete();

        return response()->json(['message' => 'Story deleted successfully']);
    }
}
