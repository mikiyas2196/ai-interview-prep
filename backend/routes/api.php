<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\JobPostingController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\PreparationPlanController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\MemoryController;
use App\Http\Controllers\Api\StoryController;
use App\Http\Controllers\Api\ProgressController;

/*
|--------------------------------------------------------------------------
| API Routes - AI Interview Prep Platform
|--------------------------------------------------------------------------
*/

// Public Auth Routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected Candidate Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Profile & Settings Management
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    Route::post('/profile/skills', [ProfileController::class, 'addSkill']);
    Route::delete('/profile/skills/{id}', [ProfileController::class, 'deleteSkill']);

    Route::post('/profile/education', [ProfileController::class, 'addEducation']);
    Route::delete('/profile/education/{id}', [ProfileController::class, 'deleteEducation']);

    Route::post('/profile/experience', [ProfileController::class, 'addExperience']);
    Route::delete('/profile/experience/{id}', [ProfileController::class, 'deleteExperience']);

    Route::post('/profile/projects', [ProfileController::class, 'addProject']);
    Route::delete('/profile/projects/{id}', [ProfileController::class, 'deleteProject']);

    Route::get('/settings', [ProfileController::class, 'getSettings']);
    Route::put('/settings', [ProfileController::class, 'updateSettings']);

    // Job Vacancies & Skill Gap Analysis
    Route::get('/jobs', [JobPostingController::class, 'index']);
    Route::post('/jobs', [JobPostingController::class, 'store']);
    Route::get('/jobs/{id}', [JobPostingController::class, 'show']);
    Route::post('/jobs/{id}/analyze', [JobPostingController::class, 'analyze']);
    Route::delete('/jobs/{id}', [JobPostingController::class, 'destroy']);

    // Resumes & CV AI Extraction
    Route::get('/resumes', [ResumeController::class, 'index']);
    Route::post('/resumes/upload', [ResumeController::class, 'upload']);
    Route::post('/resumes/{id}/apply', [ResumeController::class, 'applyToProfile']);

    // Preparation Plans
    Route::get('/plans/current', [PreparationPlanController::class, 'getCurrentPlan']);
    Route::post('/plans/generate', [PreparationPlanController::class, 'generatePlan']);
    Route::put('/plans/items/{itemId}/toggle', [PreparationPlanController::class, 'toggleItem']);

    // Mock Interviews & Question Engine
    Route::get('/interviews', [InterviewController::class, 'index']);
    Route::post('/interviews/start', [InterviewController::class, 'startSession']);
    Route::get('/interviews/{id}', [InterviewController::class, 'showSession']);
    Route::post('/interviews/{sessionId}/questions/{questionId}/answer', [InterviewController::class, 'submitAnswer']);
    Route::post('/interviews/{sessionId}/questions/{questionId}/follow-up', [InterviewController::class, 'submitFollowUp']);
    Route::post('/interviews/{id}/complete', [InterviewController::class, 'completeSession']);
    Route::get('/interviews/{id}/report', [InterviewController::class, 'getReport']);

    // Candidate Long-Term AI Memory Privacy & Management
    Route::get('/memories', [MemoryController::class, 'index']);
    Route::put('/memories/{id}', [MemoryController::class, 'update']);
    Route::delete('/memories/{id}', [MemoryController::class, 'destroy']);
    Route::post('/memories/clear', [MemoryController::class, 'clearAll']);

    // Story Bank
    Route::get('/stories', [StoryController::class, 'index']);
    Route::post('/stories', [StoryController::class, 'store']);
    Route::get('/stories/{id}', [StoryController::class, 'show']);
    Route::put('/stories/{id}', [StoryController::class, 'update']);
    Route::delete('/stories/{id}', [StoryController::class, 'destroy']);

    // Analytics & SaaS Dashboard Progress
    Route::get('/progress/overview', [ProgressController::class, 'getOverview']);
});
