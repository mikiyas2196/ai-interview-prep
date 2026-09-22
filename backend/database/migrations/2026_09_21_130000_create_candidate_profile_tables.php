<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name')->nullable();
            $table->string('professional_headline')->nullable();
            $table->string('location')->nullable();
            $table->string('phone')->nullable();
            $table->string('profile_photo_url')->nullable();
            $table->text('career_goal')->nullable();
            $table->json('target_roles')->nullable();
            $table->text('professional_summary')->nullable();
            $table->json('languages')->nullable();
            $table->timestamps();
        });

        Schema::create('educations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('institution');
            $table->string('degree');
            $table->string('field_of_study')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company');
            $table->string('title');
            $table->string('location')->nullable();
            $table->string('type')->default('full-time'); // full-time, part-time, internship, contract
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->json('technologies')->nullable();
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('category')->default('technical'); // technical, soft, language, domain
            $table->string('proficiency_level')->default('intermediate'); // beginner, intermediate, advanced, expert
            $table->integer('years_of_experience')->default(1);
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('role')->nullable();
            $table->json('technologies')->nullable();
            $table->string('url')->nullable();
            $table->json('key_achievements')->nullable();
            $table->timestamps();
        });

        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('issuing_organization')->nullable();
            $table->string('issue_date')->nullable();
            $table->string('credential_id')->nullable();
            $table->string('credential_url')->nullable();
            $table->timestamps();
        });

        Schema::create('user_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('memory_enabled')->default(true);
            $table->boolean('voice_enabled')->default(false);
            $table->boolean('immediate_feedback')->default(false);
            $table->string('preferred_ai_model')->default('gemini-2.5-flash');
            $table->boolean('dark_mode')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
        Schema::dropIfExists('certifications');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('educations');
        Schema::dropIfExists('profiles');
    }
};
