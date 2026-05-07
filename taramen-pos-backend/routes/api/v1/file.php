<?php

use App\Http\Controllers\product\FileController;
use Illuminate\Support\Facades\Route;

Route::controller(FileController::class)->group(function () {
    Route::middleware(["auth:sanctum"])
        ->get("get/menu-item/{storage_filename}", 'getMenuItemImage')
        ->name("secure.menu.image");

    Route::middleware(["signed"])
        ->get("signed/menu-item/{storage_filename}", 'getMenuItemImage')
        ->name("secure.menu.image.signed");
});
