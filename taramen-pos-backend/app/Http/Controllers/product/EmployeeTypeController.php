<?php

namespace App\Http\Controllers\product;

use App\Http\Controllers\Controller;
use App\Http\Requests\EmployeeTypeRequest;
use App\Http\Responses\ApiResponse;
use App\Models\EmployeeType;
use App\Services\EmployeeTypeService;

class EmployeeTypeController extends Controller
{
    public function __construct(protected EmployeeTypeService $employeeTypeService)
    {}

    public function index()
    {
        return ApiResponse::success(
            $this->employeeTypeService->listActive(),
            'Active employee types retrieved successfully'
        );
    }

    public function all()
    {
        return ApiResponse::success(
            $this->employeeTypeService->listAll(),
            'All employee types retrieved successfully'
        );
    }

    public function store(EmployeeTypeRequest $request)
    {
        return ApiResponse::success(
            $this->employeeTypeService->create($request->validated()),
            'Employee type created successfully',
            201
        );
    }

    public function show($id)
    {
        return ApiResponse::success(
            $this->employeeTypeService->get($id),
            'Employee type retrieved successfully'
        );
    }

    public function update(EmployeeTypeRequest $request, string $id)
    {
        $employeeType = EmployeeType::findOrFail($id);

        return ApiResponse::success(
            $this->employeeTypeService->update($employeeType, $request->validated()),
            'Employee type updated successfully'
        );
    }

    public function toggleStatus($id)
    {
        $employeeType = $this->employeeTypeService->toggleStatus($id);

        return ApiResponse::success(
            [
                'id' => $employeeType->id,
                'name' => $employeeType->name,
                'active' => $employeeType->active,
            ],
            'Employee type status toggled successfully'
        );
    }

    public function destroy(string $id)
    {
        $this->employeeTypeService->delete($id);

        return ApiResponse::success(
            ['id' => (int) $id],
            'Employee type deleted successfully'
        );
    }
}
