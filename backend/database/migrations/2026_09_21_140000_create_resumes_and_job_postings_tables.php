<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->default('pdf');
            $table->longText('extracted_text')->nullable();
            $table->string('status')->default('uploaded'); // uploaded, processing, analyzed, failed
            $table->json('parsed_data')->nullable();
            $table->timestamps();
        });

        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('job_title');
            $table->string('company')->nullable();
            $table->string('location')->nullable();
            $table->longText('raw_description');
            $table->string('status')->default('pending'); // pending, analyzed, failed
            $table->string('experience_level')->nullable();
            $table->string('education_requirements')->nullable();
            $table->timestamps();
        });

        Schema::create('job_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained()->onDelete('cascade');
            $table->json('required_skills')->nullable();
            $table->json('preferred_skills')->nullable();
            $table->json('responsibilities')->nullable();
            $table->json('technical_requirements')->nullable();
            $table->json('soft_skills')->nullable();
            $table->json('key_topics')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_requirements');
        Schema::dropIfExists('job_postings');
        Schema::dropIfExists('resumes');
    }
};
