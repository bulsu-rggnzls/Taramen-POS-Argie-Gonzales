<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use App\Services\AuthService;

class AuthController extends Controller
{

    public function __construct(
        protected AuthService $authService
    ) {}

    public function login(AuthRequest $request){
        
        $data = $this->authService->login($request->validated());

        return ApiResponse::success(
            $data,
            'Login successful',
            201
        );
    }

    public function logout(Request $request){
        $this->authService->logout($request->user());

        return ApiResponse::success(
            ['logged_out' => true],
            'Logged out'
        );
    }

    public function user(Request $request){
        return ApiResponse::success(
            $request->user(),
            'Authenticated user retrieved successfully'
        );
    }
}
