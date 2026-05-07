<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\product\EmployeeController;
use App\Http\Controllers\product\EmployeeTypeController;

Route::middleware(['auth:sanctum'])->group(function (){

    Route::get('employee-types/all', [EmployeeTypeController::class, 'all']);
    Route::patch('employee-types/{id}/toggle-status', [EmployeeTypeController::class, 'toggleStatus']);
    Route::apiResource('employee-types', EmployeeTypeController::class);

    Route::patch('employees/batch-status', [EmployeeController::class, 'batchStatus'])
        ->name('employees.batchStatus');
    Route::patch('employees/{id}/toggle-status', [EmployeeController::class, 'toggleStatus']);
    Route::get('employees/all', [EmployeeController::class, 'getAllEmployees']);

    Route::apiResource('employees', EmployeeController::class);
});