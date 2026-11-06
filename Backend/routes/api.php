<?php

use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\InfoController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\MoodController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\ScreeningController;
use App\Http\Controllers\Api\SelfCareController;
use App\Http\Controllers\Api\SupportController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login'])->name('login');
});
Route::get('information', [InfoController::class, 'index']);
Route::get('support', [SupportController::class, 'index']);
Route::get('self-care', [SelfCareController::class, 'index']);
Route::get('self-care/{selfCare}', [SelfCareController::class, 'show']);
Route::get('screening/questions', [ScreeningController::class, 'questions']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('moods', [MoodController::class, 'index']);
    Route::post('moods', [MoodController::class, 'store']);
    Route::get('moods/{mood}', [MoodController::class, 'show']);
    Route::delete('moods/{mood}', [MoodController::class, 'destroy']);
    Route::get('journals', [JournalController::class, 'index']);
    Route::post('journals', [JournalController::class, 'store']);
    Route::get('journals/{journal}', [JournalController::class, 'show']);
    Route::put('journals/{journal}', [JournalController::class, 'update']);
    Route::delete('journals/{journal}', [JournalController::class, 'destroy']);
    Route::get('screenings', [ScreeningController::class, 'index']);
    Route::post('screenings', [ScreeningController::class, 'store']);
    Route::get('screenings/{screening}', [ScreeningController::class, 'show']);
    Route::get('goals', [GoalController::class, 'index']);
    Route::post('goals', [GoalController::class, 'store']);
    Route::put('goals/{goal}', [GoalController::class, 'update']);
    Route::delete('goals/{goal}', [GoalController::class, 'destroy']);
    Route::get('progress', [ProgressController::class, 'index']);
    Route::get('ai/history', [AiController::class, 'history']);
    Route::delete('ai/history', [AiController::class, 'clearHistory']);
    Route::post('ai/chat',[AiController::class, 'chat'])->middleware('throttle:ai-chat');
});
