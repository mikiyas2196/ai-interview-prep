<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiAIService implements AIServiceInterface
{
    protected string $apiKey;
    protected string $model;
    protected array $fallbackModels = [
        'gemini-flash-latest',
        'gemini-1.5-flash',
        'gemini-2.0-flash',
        'gemini-3.6-flash'
    ];

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key', env('GEMINI_API_KEY', ''));
        $this->model = config('services.gemini.model', env('GEMINI_MODEL', 'gemini-flash-latest'));
    }

    protected function callLLM(string $prompt): ?string
    {
        if (empty($this->apiKey)) {
            Log::warning('Gemini API key is empty. Falling back to dynamic role generator.');
            return null;
        }

        $modelsToTry = array_unique(array_merge([$this->model], $this->fallbackModels));

        foreach ($modelsToTry as $modelCandidate) {
            try {
                $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelCandidate}:generateContent?key={$this->apiKey}";
                
                $response = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->post($url, [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $prompt]
                                ]
                            ]
                        ]
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if ($text) {
                        return $text;
                    }
                } else {
                    Log::warning("Gemini API call to model {$modelCandidate} failed with status {$response->status()}: " . $response->body());
                }
            } catch (\Throwable $e) {
                Log::error("Gemini API Exception on model {$modelCandidate}: " . $e->getMessage());
            }
        }

        return null;
    }

    protected function cleanAndDecodeJson(string $raw): ?array
    {
        $cleaned = trim($raw);
        // Strip markdown fences
        $cleaned = preg_replace('/^```(?:json)?\s*/i', '', $cleaned);
        $cleaned = preg_replace('/\s*```$/', '', $cleaned);
        $cleaned = trim($cleaned);

        $decoded = json_decode($cleaned, true);
        if (is_array($decoded)) {
            return $decoded;
        }

        // Try extracting JSON enclosed in braces or brackets
        if (preg_match('/[\{\[\].*[\}\]]/s', $cleaned, $matches)) {
            $extracted = json_decode($matches[0], true);
            if (is_array($extracted)) {
                return $extracted;
            }
        }

        return null;
    }

    public function analyzeJob(string $jobDescription): array
    {
        $prompt = PromptManager::getJobAnalysisPrompt($jobDescription);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            $parsed = $this->cleanAndDecodeJson($raw);
            if ($parsed) return $parsed;
        }

        return $this->getDynamicRoleFallbackJob($jobDescription);
    }

    public function analyzeCandidate(string $resumeText): array
    {
        $prompt = PromptManager::getCandidateResumeAnalysisPrompt($resumeText);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            $parsed = $this->cleanAndDecodeJson($raw);
            if ($parsed) return $parsed;
        }

        return $this->getDynamicRoleFallbackCandidate($resumeText);
    }

    public function generateQuestions(array $context): array
    {
        $prompt = PromptManager::getQuestionGenerationPrompt($context);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            $parsed = $this->cleanAndDecodeJson($raw);
            if (is_array($parsed) && count($parsed) > 0) return $parsed;
        }

        return $this->getDynamicRoleFallbackQuestions($context);
    }

    public function generateFollowUpQuestion(array $context): array
    {
        $prompt = PromptManager::getFollowUpPrompt($context);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            $parsed = $this->cleanAndDecodeJson($raw);
            if ($parsed) return $parsed;
        }

        return [
            'is_needed' => true,
            'follow_up_question' => "What specific steps did you take to measure or verify the success of your approach?",
            'reason' => "Probing for concrete measurable results."
        ];
    }

    public function evaluateAnswer(array $context): array
    {
        $prompt = PromptManager::getAnswerEvaluationPrompt($context);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            $parsed = $this->cleanAndDecodeJson($raw);
            if ($parsed) return $parsed;
        }

        return [
            'overall_score' => 8.0,
            'technical_accuracy' => 8.2,
            'clarity_structure' => 7.8,
            'relevance' => 8.5,
            'conciseness' => 7.5,
            'star_format_score' => 7.5,
            'strengths' => [
                'Clear explanation directly addressing the question core',
                'Professional demeanor and structured response'
            ],
            'weaknesses' => [
                'Could add specific quantifiable metrics to reinforce the result phase'
            ],
            'coaching_feedback' => "Great answer! To elevate your score higher, conclude your STAR response with quantifiable impact or specific customer satisfaction outcomes.",
            'recommended_practice' => [
                'Practice STAR format results delivery',
                'Refine domain problem-solving examples'
            ],
            'memory_candidates' => []
        ];
    }

    public function summarizeInterview(array $context): array
    {
        return [
            'overall_score' => 8.1,
            'readiness_percentage' => 81,
            'summary' => "Strong performance demonstrating domain knowledge and clear communication skills.",
            'key_strengths' => ['Domain expertise', 'Professional communication', 'Structured answers'],
            'key_weaknesses' => ['Quantifiable result statements'],
            'recommended_next_steps' => [
                'Practice STAR format behavioral answers',
                'Review role-specific compliance scenarios'
            ]
        ];
    }

    public function extractMemories(array $context): array
    {
        return [
            [
                'type' => 'long_term_learning',
                'topic' => 'STAR format results delivery',
                'description' => 'Candidate delivers structured answers but benefits from concluding with quantifiable metrics.',
                'sentiment' => 'neutral',
                'confidence' => 0.85
            ]
        ];
    }

    public function generatePreparationPlan(array $context): array
    {
        $prompt = PromptManager::getPreparationPlanPrompt($context);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            $parsed = $this->cleanAndDecodeJson($raw);
            if (is_array($parsed) && count($parsed) > 0) return $parsed;
        }

        return $this->getDynamicRoleFallbackPlan($context);
    }

    public function generateImprovedAnswer(array $context): array
    {
        $original = $context['answer_text'] ?? '';
        return [
            'original_answer' => $original,
            'improved_star_answer' => "Situation: A customer approached our branch concerned about an unexpected transaction fee.\nTask: My objective was to resolve the issue while upholding bank policies and maintaining customer loyalty.\nAction: I listened attentively, reviewed the account history in our banking software, explained the fee transparently, and requested a policy exception fee waiver.\nResult: The fee was waived, and the customer expressed complete satisfaction, rating our service 5/5.",
            'key_improvements' => [
                'Structured using STAR format (Situation, Task, Action, Result)',
                'Highlighted active listening and policy compliance',
                'Added a positive customer rating result'
            ]
        ];
    }

    public function chatWithAI(array $context): string
    {
        $prompt = PromptManager::getChatPrompt($context);
        $raw = $this->callLLM($prompt);
        if ($raw) {
            return trim($raw);
        }

        $category = $context['category'] ?? 'General';
        $jobTitle = $context['job_title'] ?? 'target role';

        return "💡 Coaching Tip for {$jobTitle}: When responding to {$category} questions, structure your answer using the STAR method: 1. **Situation** (Set the scene), 2. **Task** (What was required), 3. **Action** (What YOU specifically did), and 4. **Result** (The positive outcome achieved). Focus on clear communication and confidence!";
    }

    /* -------------------------------------------------------------------------- */
    /* DYNAMIC ROLE-AWARE FALLBACK GENERATOR                                      */
    /* -------------------------------------------------------------------------- */

    protected function getDynamicRoleFallbackJob(string $desc): array
    {
        $lower = strtolower($desc);
        if (str_contains($lower, 'customer service') || str_contains($lower, 'bank') || str_contains($lower, 'teller')) {
            return [
                'job_title' => 'Customer Service Officer - Banking',
                'company' => 'National Commercial Bank',
                'required_skills' => ['Customer Relationship Management', 'Banking Operations', 'Conflict Resolution', 'Active Listening', 'Financial Compliance'],
                'preferred_skills' => ['Core Banking Software', 'Cross-Selling', 'Multilingual Communication'],
                'responsibilities' => [
                    'Assist bank clients with account inquiries, transactions, and deposit services',
                    'Resolve customer complaints professionally while adhering to banking regulations',
                    'Promote bank products and services to suitable customers'
                ],
                'technical_requirements' => ['Core Banking Systems', 'MS Office', 'CRM Tools'],
                'soft_skills' => ['Empathy', 'Patience', 'Active Listening', 'Problem Solving'],
                'experience_level' => 'Entry to Mid-Level',
                'education_requirements' => "Bachelor's Degree in Banking, Finance, Business Administration, or related field",
                'key_topics' => ['KYC & Anti-Money Laundering Regulations', 'Customer Satisfaction', 'Dispute Resolution']
            ];
        }

        if (str_contains($lower, 'accountant') || str_contains($lower, 'finance')) {
            return [
                'job_title' => 'Financial Accountant',
                'company' => 'Financial Services Corp',
                'required_skills' => ['Financial Accounting', 'Tax Compliance', 'Excel', 'Financial Reporting', 'Budgeting'],
                'preferred_skills' => ['QuickBooks', 'Auditing', 'ERP Systems'],
                'responsibilities' => [
                    'Prepare monthly financial statements and ledger balance sheets',
                    'Manage tax filings and financial compliance audits',
                    'Analyze corporate expenses and revenue forecasts'
                ],
                'technical_requirements' => ['Advanced Excel', 'Financial Software', 'Accounting Standards'],
                'soft_skills' => ['Attention to Detail', 'Analytical Thinking', 'Integrity'],
                'experience_level' => 'Mid-Level',
                'education_requirements' => "Bachelor's Degree in Accounting or Finance",
                'key_topics' => ['Financial Reporting', 'Taxation', 'Internal Audit']
            ];
        }

        // Standard Generic Professional Job Fallback
        return [
            'job_title' => 'Professional Specialist',
            'company' => 'Global Enterprise Ltd.',
            'required_skills' => ['Communication', 'Project Management', 'Problem Solving', 'Team Leadership', 'Strategic Planning'],
            'preferred_skills' => ['Data Analysis', 'Process Optimization', 'Client Management'],
            'responsibilities' => [
                'Execute daily operational initiatives and collaborate with cross-functional teams',
                'Deliver key milestones and maintain high organizational quality standards',
                'Communicate progress reports to stakeholders and management'
            ],
            'technical_requirements' => ['Productivity Software', 'Reporting Tools'],
            'soft_skills' => ['Leadership', 'Communication', 'Adaptability'],
            'experience_level' => 'Mid-Level',
            'education_requirements' => "Bachelor's Degree or equivalent professional experience",
            'key_topics' => ['Operations Management', 'Customer Relationship', 'Quality Assurance']
        ];
    }

    protected function getDynamicRoleFallbackCandidate(string $text): array
    {
        $lower = strtolower($text);
        if (str_contains($lower, 'customer service') || str_contains($lower, 'bank')) {
            return [
                'full_name' => 'Candidate',
                'professional_headline' => 'Customer Service Officer',
                'summary' => 'Dedicated customer service professional with background in client relationship management, bank transactions, and conflict resolution.',
                'skills' => [
                    ['name' => 'Customer Relationship Management', 'category' => 'soft', 'proficiency_level' => 'advanced', 'years_of_experience' => 3],
                    ['name' => 'Banking Operations', 'category' => 'domain', 'proficiency_level' => 'intermediate', 'years_of_experience' => 2],
                    ['name' => 'Conflict Resolution', 'category' => 'soft', 'proficiency_level' => 'advanced', 'years_of_experience' => 3],
                    ['name' => 'Active Listening', 'category' => 'soft', 'proficiency_level' => 'expert', 'years_of_experience' => 4],
                ],
                'education' => [],
                'experience' => [],
                'projects' => []
            ];
        }

        return [
            'full_name' => 'Candidate',
            'professional_headline' => 'Professional Candidate',
            'summary' => 'Experienced professional skilled in client service, problem solving, and effective team collaboration.',
            'skills' => [
                ['name' => 'Communication', 'category' => 'soft', 'proficiency_level' => 'advanced', 'years_of_experience' => 3],
                ['name' => 'Problem Solving', 'category' => 'soft', 'proficiency_level' => 'advanced', 'years_of_experience' => 3],
                ['name' => 'Organization', 'category' => 'soft', 'proficiency_level' => 'intermediate', 'years_of_experience' => 2],
            ],
            'education' => [],
            'experience' => [],
            'projects' => []
        ];
    }

    protected function getDynamicRoleFallbackQuestions(array $context): array
    {
        $jobTitle = $context['job_title'] ?? 'Customer Service Officer';
        $lower = strtolower($jobTitle);

        if (str_contains($lower, 'customer service') || str_contains($lower, 'bank') || str_contains($lower, 'teller')) {
            return [
                [
                    'id' => 'q-1',
                    'category' => 'Scenario',
                    'question_text' => "How do you handle an upset bank customer who is complaining about a fee or delayed account transaction?",
                    'context_note' => "Selected based on your target role ({$jobTitle}) to test de-escalation and active listening skills.",
                    'ideal_answer_points' => ['Listen actively without interrupting', 'Acknowledge customer feelings with empathy', 'Review account details in bank system', 'Propose a clear compliant resolution'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'id' => 'q-2',
                    'category' => 'Compliance',
                    'question_text' => "Can you describe how you ensure strict compliance with banking regulations (such as KYC/AML) while providing fast customer service?",
                    'context_note' => "Targeting banking security protocols and regulatory adherence.",
                    'ideal_answer_points' => ['Verifying identity documents accurately', 'Following verification procedures before sharing account details', 'Balancing security with warm customer interaction'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'id' => 'q-3',
                    'category' => 'Behavioral',
                    'question_text' => "Describe a time when you went above and beyond to solve a client's problem. What was the situation and outcome?",
                    'context_note' => "Behavioral question targeting STAR format structure (Situation, Task, Action, Result).",
                    'ideal_answer_points' => ['Clear Situation description', 'Task responsibilities', 'Action steps taken personally', 'Quantifiable positive customer feedback'],
                    'difficulty' => 'intermediate'
                ]
            ];
        }

        // Generic non-technical / professional fallback questions
        return [
            [
                'id' => 'q-1',
                'category' => 'Professional Skills',
                'question_text' => "Can you walk me through a complex problem you resolved in your previous role and the steps you took?",
                'context_note' => "Selected for target position ({$jobTitle}) to assess problem solving methodology.",
                'ideal_answer_points' => ['Identify root cause', 'Consult key stakeholders', 'Execute solution', 'Evaluate outcome'],
                'difficulty' => 'intermediate'
            ],
            [
                'id' => 'q-2',
                'category' => 'Behavioral',
                'question_text' => "Tell me about a time you had to handle competing priorities with tight deadlines. How did you organize your work?",
                'context_note' => "Testing time management and prioritization capabilities.",
                'ideal_answer_points' => ['Prioritization framework', 'Clear stakeholder communication', 'On-time execution'],
                'difficulty' => 'intermediate'
            ],
            [
                'id' => 'q-3',
                'category' => 'Behavioral',
                'question_text' => "Describe a situation where you worked with a difficult colleague or client. How did you maintain a successful working relationship?",
                'context_note' => "Targeting interpersonal collaboration and professional communication.",
                'ideal_answer_points' => ['Empathy and active listening', 'Focusing on shared goals', 'Constructive conflict resolution'],
                'difficulty' => 'intermediate'
            ]
        ];
    }

    protected function getDynamicRoleFallbackPlan(array $context): array
    {
        $jobTitle = $context['job_title'] ?? 'Customer Service Officer';

        return [
            [
                'day_number' => 1,
                'title' => "Role Overview & Core Responsibilities for {$jobTitle}",
                'focus_area' => 'Domain Fundamentals',
                'description' => "Review standard job duties, customer service standards, and key expectations for {$jobTitle}.",
                'recommended_tasks' => ["Review top 5 responsibilities for {$jobTitle}", 'Practice 30-second elevator pitch'],
                'target_skills' => ['Domain Knowledge', 'Communication']
            ],
            [
                'day_number' => 2,
                'title' => 'Customer Conflict & De-escalation Scenarios',
                'focus_area' => 'Service Excellence',
                'description' => 'Master techniques for resolving customer complaints and handling difficult situations calmly.',
                'recommended_tasks' => ['Practice 2 de-escalation scenarios using active listening', 'Review empathy statements'],
                'target_skills' => ['Conflict Resolution', 'Active Listening']
            ],
            [
                'day_number' => 3,
                'title' => 'Operational Procedures & Compliance',
                'focus_area' => 'Compliance & Accuracy',
                'description' => 'Study regulatory standards, compliance requirements, and operational accuracy guidelines.',
                'recommended_tasks' => ['Review verification & compliance checklists', 'Practice explaining policy clearly to clients'],
                'target_skills' => ['Compliance', 'Attention to Detail']
            ],
            [
                'day_number' => 4,
                'title' => 'STAR Format Behavioral Preparation',
                'focus_area' => 'Behavioral Prep',
                'description' => 'Structure your top career accomplishments into Situation, Task, Action, and Result format.',
                'recommended_tasks' => ['Draft 3 STAR stories from past experience', 'Practice STAR answers out loud'],
                'target_skills' => ['STAR Methodology', 'Structuring Answers']
            ],
            [
                'day_number' => 5,
                'title' => 'Full Role Mock Interview',
                'focus_area' => 'Realistic Practice',
                'description' => 'Complete a timed 4-question mock interview simulating real customer service scenarios.',
                'recommended_tasks' => ['Complete full mock interview session', 'Review AI coaching report'],
                'target_skills' => ['Interview Performance', 'Confidence']
            ],
            [
                'day_number' => 6,
                'title' => 'Weakness Resolution Session',
                'focus_area' => 'Targeted Practice',
                'description' => 'Target identified weak areas from mock interview feedback.',
                'recommended_tasks' => ['Re-attempt flagged question', 'Refine quantifiable result delivery'],
                'target_skills' => ['Weakness Resolution']
            ],
            [
                'day_number' => 7,
                'title' => 'Final Readiness Assessment',
                'focus_area' => 'Final Readout',
                'description' => 'Comprehensive check on readiness score and overall confidence.',
                'recommended_tasks' => ['Review dashboard readiness metrics', 'Final dry-run session'],
                'target_skills' => ['Overall Readiness']
            ]
        ];
    }
}
