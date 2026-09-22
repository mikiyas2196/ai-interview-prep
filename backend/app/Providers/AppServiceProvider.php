<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AI\AIServiceInterface;
use App\Services\AI\GeminiAIService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AIServiceInterface::class, GeminiAIService::class);
    }

    public function boot(): void
    {
        //
    }
}
