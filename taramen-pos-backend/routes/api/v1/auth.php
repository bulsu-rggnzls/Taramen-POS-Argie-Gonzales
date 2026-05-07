<?php

use App\Http\Controllers\auth\AuthController;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::controller(AuthController::class)->group(function () {
    Route::post('/login', 'login');
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});