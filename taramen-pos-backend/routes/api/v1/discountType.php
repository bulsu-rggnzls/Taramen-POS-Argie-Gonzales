<?php

use App\Http\Controllers\product\DiscountController;
use App\Http\Controllers\product\DiscountTypeController;
use Illuminate\Support\Facades\Route;

// Public Routes

// Protected Routes
Route::middleware('auth:sanctum')->controller(DiscountTypeController::class)->group(function () {
    Route::post('create/discount-types', 'createDiscountTypes');
    Route::put('update/discount-types/{id}', 'updateDiscountTypes');
    Route::get('get/discount-types', 'getDiscountTypes');
    Route::delete('delete/discount-types/{id}', 'deleteDiscountTypes');
});
