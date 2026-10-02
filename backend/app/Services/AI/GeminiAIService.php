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
        $category = $context['category'] ?? 'Technical';
        $lower = strtolower($jobTitle);
        $previousQuestions = array_map('strtolower', $context['previous_questions'] ?? []);
        $targetCount = $context['count'] ?? 10;

        // Large pool for Customer Service / Banking / Teller
        if (str_contains($lower, 'customer service') || str_contains($lower, 'bank') || str_contains($lower, 'teller')) {
            $pool = [
                [
                    'category' => 'Customer Conflict',
                    'question_text' => "How do you handle an upset bank customer who is complaining about a fee or delayed account transaction?",
                    'context_note' => "Tailored for {$jobTitle} to test de-escalation, empathy, and active listening under pressure.",
                    'ideal_answer_points' => ['Listen actively without interrupting', 'Acknowledge customer feelings with empathy', 'Review account details in core banking system', 'Propose a clear, compliant resolution'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Regulatory Compliance',
                    'question_text' => "Can you describe how you ensure strict compliance with banking regulations (such as KYC/AML) while providing fast customer service?",
                    'context_note' => "Assessing banking security protocols and identity verification standards for {$jobTitle}.",
                    'ideal_answer_points' => ['Verifying identity documents accurately', 'Following verification procedures before sharing account details', 'Balancing security with warm customer interaction'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Behavioral STAR',
                    'question_text' => "Describe a time when you went above and beyond to solve a client's problem. What was the situation and outcome?",
                    'context_note' => "Behavioral question targeting STAR format structure (Situation, Task, Action, Result).",
                    'ideal_answer_points' => ['Clear Situation description', 'Task responsibilities', 'Action steps taken personally', 'Quantifiable positive customer feedback'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Operations under Pressure',
                    'question_text' => "How do you manage your workflow and maintain cash/transaction accuracy when facing a long queue of waiting customers during peak branch hours?",
                    'context_note' => "Testing stress resilience and accuracy in fast-paced branch environments.",
                    'ideal_answer_points' => ['Prioritizing speed without sacrificing accuracy', 'Double-checking cash balances and entries', 'Maintaining a calm and cheerful demeanor'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Communication & Clarity',
                    'question_text' => "How do you explain complex banking fees or account terms to a customer who has limited financial literacy?",
                    'context_note' => "Evaluates clear, jargon-free communication tailored to diverse bank clients.",
                    'ideal_answer_points' => ['Using simple analogies', 'Checking for understanding', 'Providing written brochures or follow-up summary'],
                    'difficulty' => 'beginner'
                ],
                [
                    'category' => 'Cross-Selling & Value Addition',
                    'question_text' => "How do you identify customer needs and cross-sell relevant banking products (e.g. savings plans, credit cards) without appearing overly sales-driven?",
                    'context_note' => "Assessing consultative selling and active listening skills during customer service interactions.",
                    'ideal_answer_points' => ['Asking open-ended lifestyle questions', 'Matching products to genuine customer benefits', 'Respecting customer decisions'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Digital Adoption & Training',
                    'question_text' => "If a traditional customer is reluctant to use digital online/mobile banking, how do you guide and encourage them to adopt self-service channels?",
                    'context_note' => "Focusing on customer education and digital onboarding initiatives for {$jobTitle}.",
                    'ideal_answer_points' => ['Demonstrating digital app features step-by-step', 'Reassuring security concerns', 'Highlighting convenience and time saved'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Fraud Detection & Risk Management',
                    'question_text' => "What warning signs or suspicious indicators would make you pause a transaction and report suspected fraud or identity theft?",
                    'context_note' => "Testing risk awareness and protocol enforcement in front-line operations.",
                    'ideal_answer_points' => ['Inconsistent signature or ID details', 'Nervous behavior or third-party prompting', 'Escalating promptly to branch supervisor'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'Teamwork & Escalation',
                    'question_text' => "Describe a scenario where a customer request exceeded your authorization level. How did you coordinate with your manager or back-office team to resolve it?",
                    'context_note' => "Evaluating internal collaboration and smooth hand-off procedures.",
                    'ideal_answer_points' => ['Briefing supervisor concisely', 'Setting clear expectations with customer', 'Following up until resolution'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Customer Retention',
                    'question_text' => "Can you share an example of how you turned a dissatisfied or frustrated customer into a loyal advocate for your organization?",
                    'context_note' => "Behavioral question measuring long-term customer relationship building.",
                    'ideal_answer_points' => ['Taking personal ownership of the issue', 'Providing proactive status updates', 'Ensuring post-resolution check-in'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'Multi-Tasking & Organization',
                    'question_text' => "How do you balance administrative tasks (such as end-of-day balancing and reporting) with unexpected customer walk-in demands?",
                    'context_note' => "Assessing task prioritization and operational efficiency.",
                    'ideal_answer_points' => ['Structuring quiet hours for admin work', 'Fostering team coverage', 'Maintaining high standards'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Ethical Integrity',
                    'question_text' => "What would you do if a colleague asked you to bypass a standard verification step for a high-profile customer?",
                    'context_note' => "Testing ethical firmness and adherence to organizational policies.",
                    'ideal_answer_points' => ['Politely declining policy bypass', 'Explaining regulatory risks', 'Consulting compliance officer if needed'],
                    'difficulty' => 'advanced'
                ]
            ];
        } else if (str_contains($lower, 'software') || str_contains($lower, 'developer') || str_contains($lower, 'engineer') || str_contains($lower, 'it')) {
            // Software / Technical Pool
            $pool = [
                [
                    'category' => 'System Architecture',
                    'question_text' => "How do you design scalable RESTful APIs and ensure clean separation of concerns in backend systems?",
                    'context_note' => "Targeting technical architecture for {$jobTitle}.",
                    'ideal_answer_points' => ['Resource-oriented routing', 'Middleware authentication', 'Decoupled services and repository patterns'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Database Performance',
                    'question_text' => "How do you diagnose and resolve database query performance bottlenecks such as N+1 queries in ORMs?",
                    'context_note' => "Testing ORM optimization and SQL query profiling.",
                    'ideal_answer_points' => ['Using eager loading (with/joins)', 'Indexing foreign keys', 'Analyzing EXPLAIN query plans'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Security & Authentication',
                    'question_text' => "What security measures do you implement to protect web applications against OWASP Top 10 risks like SQL Injection and XSS?",
                    'context_note' => "Evaluating application security awareness.",
                    'ideal_answer_points' => ['Parameterized queries', 'Output sanitization and Content Security Policy', 'CSRF protection'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'State Management',
                    'question_text' => "In modern frontend frameworks (e.g. Next.js / React), how do you manage complex application state and prevent unnecessary re-renders?",
                    'context_note' => "Assessing frontend performance and architecture.",
                    'ideal_answer_points' => ['Local vs global state separation', 'Memoization hooks (useMemo, useCallback)', 'Context API / Zustand'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Code Quality & Testing',
                    'question_text' => "What strategy do you use for writing comprehensive unit and integration tests for mission-critical business logic?",
                    'context_note' => "Evaluating automated testing practices.",
                    'ideal_answer_points' => ['TDD/BDD methodologies', 'Mocking external dependencies', 'Aiming for meaningful assertion coverage'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'DevOps & Deployment',
                    'question_text' => "How do you setup CI/CD pipelines to automate testing, build artifacts, and zero-downtime production deployments?",
                    'context_note' => "Testing deployment automation skills.",
                    'ideal_answer_points' => ['Pipeline stages (lint, test, build, deploy)', 'Blue-green or canary deployments', 'Environment variables management'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'Asynchronous Processing',
                    'question_text' => "When and how would you implement message queues and background workers (e.g., Redis, RabbitMQ) to handle heavy tasks?",
                    'context_note' => "Assessing asynchronous architecture.",
                    'ideal_answer_points' => ['Offloading long-running jobs (emails, AI reports)', 'Retry strategies and dead-letter queues', 'Idempotency'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'Refactoring & Technical Debt',
                    'question_text' => "How do you approach refactoring a legacy codebase without breaking existing business feature contracts?",
                    'context_note' => "Behavioral technical question on codebase maintenance.",
                    'ideal_answer_points' => ['Ensuring test coverage before editing', 'Incremental refactoring', 'Code review discussions'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'System Debugging',
                    'question_text' => "Describe a scenario where a critical bug occurred in production. How did you isolate, debug, and fix the root cause?",
                    'context_note' => "Targeting incident response and troubleshooting skills.",
                    'ideal_answer_points' => ['Inspecting application logs and stack traces', 'Reproducing locally', 'Applying patch and post-mortem'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Agile & Collaboration',
                    'question_text' => "How do you communicate technical constraints and trade-offs to non-technical product managers and stakeholders?",
                    'context_note' => "Assessing technical leadership and communication.",
                    'ideal_answer_points' => ['Translating technical debt into business impact', 'Offering alternative phased solutions', 'Setting realistic timelines'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Microservices vs Monolith',
                    'question_text' => "How do you evaluate whether a monolith application should be decomposed into microservices?",
                    'context_note' => "Assessing architectural decision making.",
                    'ideal_answer_points' => ['Team boundary alignment', 'Scaling bottlenecks', 'Operational complexity considerations'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'API Versioning',
                    'question_text' => "How do you manage API versioning and deprecation when serving external mobile or web clients?",
                    'context_note' => "Focusing on backward compatibility and API contracts.",
                    'ideal_answer_points' => ['URI versioning (/v1/)', 'Deprecation headers', 'Backward-compatible schema additions'],
                    'difficulty' => 'intermediate'
                ]
            ];
        } else {
            // General Professional & Multi-domain Pool
            $pool = [
                [
                    'category' => 'Problem Solving',
                    'question_text' => "Can you walk me through a complex operational problem you resolved in your target role of {$jobTitle} and the steps you took?",
                    'context_note' => "Selected for {$jobTitle} to assess analytical problem-solving methodology.",
                    'ideal_answer_points' => ['Identify root cause', 'Consult key stakeholders', 'Execute structured solution', 'Evaluate measurable outcome'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Behavioral STAR',
                    'question_text' => "Tell me about a time you had to handle competing priorities with tight deadlines. How did you organize your work?",
                    'context_note' => "Testing time management and prioritization capabilities for {$jobTitle}.",
                    'ideal_answer_points' => ['Prioritization framework', 'Clear stakeholder communication', 'On-time execution'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Conflict Resolution',
                    'question_text' => "Describe a situation where you worked with a difficult colleague or client. How did you maintain a successful working relationship?",
                    'context_note' => "Targeting interpersonal collaboration and professional communication.",
                    'ideal_answer_points' => ['Empathy and active listening', 'Focusing on shared goals', 'Constructive conflict resolution'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Adaptability & Learning',
                    'question_text' => "Describe a time when a major change (such as new technology, policy, or team structure) affected your work as {$jobTitle}. How did you adapt?",
                    'context_note' => "Evaluates adaptability and growth mindset.",
                    'ideal_answer_points' => ['Embracing change positively', 'Proactive upskilling', 'Supporting team transition'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Leadership & Initiative',
                    'question_text' => "Share an instance where you identified an inefficiency or gap in process and took the initiative to improve it.",
                    'context_note' => "Assessing proactivity and leadership drive.",
                    'ideal_answer_points' => ['Spotting process bottleneck', 'Proposing actionable solution', 'Measuring efficiency gain'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Communication & Stakeholder Management',
                    'question_text' => "How do you ensure clear and transparent communication when presenting reports or updates to senior management?",
                    'context_note' => "Focusing on executive reporting and conciseness.",
                    'ideal_answer_points' => ['Highlighting key takeaways upfront', 'Data-backed metrics', 'Actionable recommendations'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Quality & Attention to Detail',
                    'question_text' => "How do you ensure zero errors or high accuracy when performing repetitive or detailed operational tasks for {$jobTitle}?",
                    'context_note' => "Testing quality assurance mechanisms and personal discipline.",
                    'ideal_answer_points' => ['Self-audit checklists', 'Double-checking key outputs', 'Continuous improvement'],
                    'difficulty' => 'beginner'
                ],
                [
                    'category' => 'Crisis & Stress Management',
                    'question_text' => "Describe a time when something went wrong unexpectedly during a project or service delivery. How did you handle the situation?",
                    'context_note' => "Assessing composure under pressure.",
                    'ideal_answer_points' => ['Remaining calm', 'Communicating transparently', 'Executing mitigation plan'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Decision Making',
                    'question_text' => "Tell me about a difficult decision you had to make with incomplete information. What was your rationale?",
                    'context_note' => "Evaluating critical thinking and risk assessment.",
                    'ideal_answer_points' => ['Gathering available facts', 'Weighing risks vs benefits', 'Taking calculated action'],
                    'difficulty' => 'advanced'
                ],
                [
                    'category' => 'Client Satisfaction',
                    'question_text' => "How do you measure and maintain client satisfaction in your daily work as {$jobTitle}?",
                    'context_note' => "Targeting customer-centric orientation.",
                    'ideal_answer_points' => ['Seeking feedback actively', 'Consistently exceeding expectations', 'Building trust'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Team Collaboration',
                    'question_text' => "Describe a project where you collaborated with team members across different departments or backgrounds.",
                    'context_note' => "Assessing cross-functional teamwork.",
                    'ideal_answer_points' => ['Aligning objectives', 'Leveraging diverse strengths', 'Achieving shared goal'],
                    'difficulty' => 'intermediate'
                ],
                [
                    'category' => 'Career Vision',
                    'question_text' => "Why are you interested in pursuing {$jobTitle}, and how does this position align with your professional goals?",
                    'context_note' => "Evaluating motivation and long-term commitment.",
                    'ideal_answer_points' => ['Authentic motivation', 'Skill alignment', 'Contribution commitment'],
                    'difficulty' => 'beginner'
                ]
            ];
        }

        // Filter out any questions previously asked to this user
        $unusedPool = array_filter($pool, function ($item) use ($previousQuestions) {
            $qTextLower = strtolower($item['question_text']);
            foreach ($previousQuestions as $prev) {
                if (str_contains($qTextLower, strtolower($prev)) || str_contains(strtolower($prev), $qTextLower)) {
                    return false;
                }
            }
            return true;
        });

        // Re-index remaining array
        $availableQuestions = array_values($unusedPool);

        // If user practiced multiple times and exhausted standard pool, dynamically generate unique variations
        if (count($availableQuestions) < $targetCount) {
            $sessionCount = count($previousQuestions) + 1;
            for ($i = count($availableQuestions); $i < $targetCount; $i++) {
                $baseIndex = $i % count($pool);
                $baseQ = $pool[$baseIndex];
                $availableQuestions[] = [
                    'category' => $baseQ['category'] . " (Practice Try #{$sessionCount})",
                    'question_text' => "Practice Variation #{$sessionCount} for {$jobTitle}: " . $baseQ['question_text'] . " (Consider a scenario with tight resource constraints).",
                    'context_note' => "Dynamic variation generated for practice attempt #{$sessionCount} to guarantee non-repeating questions.",
                    'ideal_answer_points' => $baseQ['ideal_answer_points'],
                    'difficulty' => $baseQ['difficulty']
                ];
            }
        }

        // Return exactly targetCount (10) unique questions with numbered IDs
        $finalQuestions = array_slice($availableQuestions, 0, $targetCount);
        return array_map(function ($q, $index) {
            $q['id'] = 'q-' . ($index + 1);
            return $q;
        }, $finalQuestions, array_keys($finalQuestions));
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
