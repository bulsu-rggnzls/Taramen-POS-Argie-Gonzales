<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Version 1
|--------------------------------------------------------------------------
*/
Route::prefix('v1')
    ->group(function () {

    // Strict limit (5 / min)
    Route::middleware('throttle:limit_strict')->group(function () {
        require __DIR__ . '/api/v1/auth.php';
    });

    // Orders limit (20 / min)
    Route::middleware('throttle:limit_orders')->group(function () {
        require __DIR__ . '/api/v1/order.php';
        require __DIR__ . '/api/v1/discount.php';
    });

    // General limit (60 / min)
    Route::middleware('throttle:limit_general')->group(function () {
        require __DIR__ . '/api/v1/category.php';
        require __DIR__ . '/api/v1/menu_item.php';
        require __DIR__ . '/api/v1/employee.php';
        require __DIR__ . '/api/v1/report.php';
        require __DIR__ . '/api/v1/discountType.php';
        require __DIR__ . '/api/v1/file.php';
    });
});
