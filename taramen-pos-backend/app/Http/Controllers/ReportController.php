<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Services\ReportService;
use App\Http\Responses\ApiResponse;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reportService) {

    }
    public function summary(ReportRequest $request) {
        $validated = $request->validated();

     
        $start = $validated['start_date'] ?? today()->format('Y-m-d');

        $end = $validated['end_date'] ?? $start;

        $summary =  $this->reportService->summaryService($start, $end) ;

        $per_employee_sales = $this->reportService->employeeService($start, $end);

        $top_item =$this->reportService->topItemService($start, $end);

        return ApiResponse::success(
            [
                'total_sales' => $summary,
                'employees' => $per_employee_sales,
                'top_item' => $top_item,
            ],
            'Report summary retrieved successfully'
        );

    }


}
