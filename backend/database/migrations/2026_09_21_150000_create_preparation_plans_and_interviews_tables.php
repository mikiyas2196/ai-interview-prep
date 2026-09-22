<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preparation_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_posting_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('overall_summary')->nullable();
            $table->string('status')->default('active'); // active, completed, archived
            $table->timestamps();
        });

        Schema::create('preparation_plan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('preparation_plan_id')->constrained()->onDelete('cascade');
            $table->integer('day_number');
            $table->string('title');
            $table->string('focus_area');
            $table->text('description')->nullable();
            $table->json('recommended_tasks')->nullable();
            $table->json('target_skills')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
        });

        Schema::create('interview_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_posting_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->string('mode')->default('mock'); // practice, mock
            $table->string('category')->default('Technical'); // Technical, Behavioral, HR, Project, Situational
            $table->string('difficulty')->default('intermediate'); // beginner, intermediate, advanced
            $table->string('status')->default('in_progress'); // in_progress, completed
            $table->float('overall_score')->nullable();
            $table->timestamps();
        });

        Schema::create('interview_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_session_id')->constrained()->onDelete('cascade');
            $table->integer('question_number');
            $table->string('category');
            $table->text('question_text');
            $table->text('context_note')->nullable();
            $table->json('ideal_answer_points')->nullable();
            $table->string('difficulty')->default('intermediate');
            $table->timestamps();
        });

        Schema::create('interview_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_question_id')->constrained()->onDelete('cascade');
            $table->longText('answer_text');
            $table->text('follow_up_question')->nullable();
            $table->longText('follow_up_answer')->nullable();
            $table->string('audio_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_answers');
        Schema::dropIfExists('interview_questions');
        Schema::dropIfExists('interview_sessions');
        Schema::dropIfExists('preparation_plan_items');
        Schema::dropIfExists('preparation_plans');
    }
};
