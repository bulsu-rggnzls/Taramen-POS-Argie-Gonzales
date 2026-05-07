<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    private static function defaultMeta(array $meta = []): array
    {
        return array_merge([
            'time' => now()->format('Y-m-d H:i:s'),
            'api_version' => '1.0.0',
            'request_id' => uniqid(),
        ], $meta);
    }

    public static function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = 200,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        $payload['meta'] = self::defaultMeta($meta);

        return response()->json($payload, $status);
    }

    public static function error(
        string $message = 'Error',
        int $status = 400,
        array $errors = [],
        array $meta = []
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
            'errors' => empty($errors) ? (object) [] : $errors,
        ];

        $payload['meta'] = self::defaultMeta($meta);

        return response()->json($payload, $status);
    }
}
