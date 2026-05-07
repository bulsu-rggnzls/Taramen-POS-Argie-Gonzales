<?php

use App\Models\EndpointLog;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sanctum:prune-expired --hours=24')->dailyAt('02:00');

Schedule::call(function (): void {
    $retentionDays = max((int) env('ENDPOINT_LOG_RETENTION_DAYS', 365), 1);

    EndpointLog::where('created_at', '<', now()->subDays($retentionDays))->delete();
})->dailyAt('02:30');
