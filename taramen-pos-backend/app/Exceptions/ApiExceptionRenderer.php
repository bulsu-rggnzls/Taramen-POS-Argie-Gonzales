<?php

namespace App\Exceptions;

use App\Http\Responses\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as HttpStatus;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class ApiExceptionRenderer
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->shouldRenderJsonWhen(function (Request $request): bool {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                'Unauthorized',
                401,
                ['auth' => ['Missing, invalid, or expired access token.']]
            );
        });

        $exceptions->render(function (AuthorizationException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                'Forbidden',
                403,
                ['auth' => ['You do not have permission to perform this action.']]
            );
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                'Validation failed',
                422,
                $e->errors()
            );
        });

        $exceptions->render(function (ModelNotFoundException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                'Resource not found',
                404,
                ['resource' => ['The requested resource was not found.']]
            );
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                $e->getMessage() ?: 'Endpoint not found',
                404,
                ['route' => ['The requested endpoint or resource was not found.']]
            );
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                'Method not allowed',
                405,
                ['method' => ['The HTTP method is not supported for this endpoint.']]
            )->withHeaders($e->getHeaders());
        });

        $exceptions->render(function (TooManyRequestsHttpException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            return ApiResponse::error(
                'Too many requests',
                429,
                ['rate_limit' => ['Too many requests. Please try again later.']]
            )->withHeaders($e->getHeaders());
        });

        $exceptions->render(function (HttpException $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            $status = $e->getStatusCode();
            $message = $status >= 500
                ? 'Server error'
                : ($e->getMessage() ?: (HttpStatus::$statusTexts[$status] ?? 'HTTP error'));

            return ApiResponse::error(
                $message,
                $status,
                []
            )->withHeaders($e->getHeaders());
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! self::isApiRequest($request)) {
                return null;
            }

            Log::error('Unhandled API exception', [
                'exception' => $e,
            ]);

            $errors = config('app.debug')
                ? ['exception' => [get_class($e)], 'detail' => [$e->getMessage()]]
                : ['server' => ['An unexpected error occurred.']];

            return ApiResponse::error(
                'Server error',
                500,
                $errors
            );
        });
    }

    private static function isApiRequest(Request $request): bool
    {
        return $request->is('api/*');
    }
}
