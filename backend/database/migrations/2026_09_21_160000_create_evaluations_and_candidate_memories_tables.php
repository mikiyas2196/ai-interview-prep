<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('answer_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_answer_id')->constrained()->onDelete('cascade');
            $table->float('overall_score')->default(0);
            $table->float('technical_accuracy')->default(0);
            $table->float('clarity_structure')->default(0);
            $table->float('relevance')->default(0);
            $table->float('conciseness')->default(0);
            $table->float('star_format_score')->nullable();
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->text('coaching_feedback')->nullable();
            $table->json('recommended_practice')->nullable();
            $table->json('memory_candidates')->nullable();
            $table->timestamps();
        });

        Schema::create('interview_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_session_id')->constrained()->onDelete('cascade');
            $table->float('overall_score')->default(0);
            $table->integer('readiness_percentage')->default(50);
            $table->text('summary')->nullable();
            $table->json('strengths')->nullable();
            $table->json('weaknesses')->nullable();
            $table->json('recommended_next_steps')->nullable();
            $table->timestamps();
        });

        Schema::create('candidate_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_interview_session_id')->nullable()->constrained('interview_sessions')->onDelete('set null');
            $table->string('type')->default('long_term_learning'); // permanent_profile, long_term_learning, interview_memory, story_memory
            $table->string('topic');
            $table->text('description');
            $table->string('sentiment')->default('weakness'); // strength, weakness, preference, fact
            $table->float('confidence')->default(0.85);
            $table->json('vector_embedding')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('candidate_strengths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('topic');
            $table->float('score')->default(8.0);
            $table->integer('occurrence_count')->default(1);
            $table->timestamps();
        });

        Schema::create('candidate_weaknesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('topic');
            $table->float('score')->default(5.0);
            $table->integer('occurrence_count')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_weaknesses');
        Schema::dropIfExists('candidate_strengths');
        Schema::dropIfExists('candidate_memories');
        Schema::dropIfExists('interview_reports');
        Schema::dropIfExists('answer_evaluations');
    }
};
