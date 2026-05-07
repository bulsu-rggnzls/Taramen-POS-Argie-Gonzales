<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\product\OrderController;

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('orders/printReceipt', [OrderController::class, 'printReceipt']);
    Route::get('orders/stats', [OrderController::class, 'stats']);
    Route::get('orders/{id}/receipt', [OrderController::class, 'receipt']);


    Route::patch('orders/{id}/status', [OrderController::class, 'updateStatus'])
        ->name('orders.updateStatus');

    Route::apiResource('orders', OrderController::class);
});

