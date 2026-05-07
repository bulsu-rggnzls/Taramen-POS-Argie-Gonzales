<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth:sanctum'])->group(function() {
    Route::get('/report', [ReportController::class, 'summary']);
});
