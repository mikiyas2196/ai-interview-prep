<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('situation')->nullable();
            $table->text('task')->nullable();
            $table->text('action')->nullable();
            $table->text('result')->nullable();
            $table->text('lessons_learned')->nullable();
            $table->json('technologies')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
        });

        Schema::create('story_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained()->onDelete('cascade');
            $table->string('tag_name');
            $table->timestamps();
        });

        Schema::create('progress_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('readiness_percentage')->default(50);
            $table->float('technical_score')->default(7.0);
            $table->float('behavioral_score')->default(6.5);
            $table->float('communication_score')->default(7.0);
            $table->float('problem_solving_score')->default(7.2);
            $table->date('record_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progress_records');
        Schema::dropIfExists('story_tags');
        Schema::dropIfExists('stories');
    }
};
