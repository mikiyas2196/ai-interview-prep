<?php

namespace App\Services\AI;

interface AIServiceInterface
{
    /**
     * Analyze job description and return structured requirements.
     */
    public function analyzeJob(string $jobDescription): array;

    /**
     * Analyze raw resume text and extract candidate profile items.
     */
    public function analyzeCandidate(string $resumeText): array;

    /**
     * Generate context-aware interview questions.
     */
    public function generateQuestions(array $context): array;

    /**
     * Generate dynamic follow-up question based on candidate's answer.
     */
    public function generateFollowUpQuestion(array $context): array;

    /**
     * Evaluate interview answer across criteria.
     */
    public function evaluateAnswer(array $context): array;

    /**
     * Summarize interview performance for final report.
     */
    public function summarizeInterview(array $context): array;

    /**
     * Extract long-term candidate memories (strengths, weaknesses, facts).
     */
    public function extractMemories(array $context): array;

    /**
     * Generate dynamic multi-day preparation plan.
     */
    public function generatePreparationPlan(array $context): array;

    /**
     * Generate an improved STAR-style answer for coaching feedback.
     */
    public function generateImprovedAnswer(array $context): array;

    /**
     * Conduct real-time AI interview coaching chat.
     */
    public function chatWithAI(array $context): string;
}
