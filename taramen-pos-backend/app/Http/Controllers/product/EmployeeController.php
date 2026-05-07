<?php

namespace App\Http\Controllers\product;

use App\Http\Controllers\Controller;
use App\Services\EmployeeService;
use App\Http\Requests\EmployeeRequest;
use App\Models\Employee;
use App\Http\Responses\ApiResponse;


class EmployeeController extends Controller
{
    public function __construct(protected EmployeeService $employeeService)
    {}

    public function index(){
        return ApiResponse::success(
            $this->employeeService->listActiveEmployees(),
            'Active employees retrieved successfully'
        );
    }

    public function getAllEmployees(){
        return ApiResponse::success(
            $this->employeeService->getAllEmployees(),
            'All employees retrieved successfully'
        );
    }

    public function store(EmployeeRequest $request){
        $employee = $this->employeeService->createEmployee($request->safe()->except('profile'));
        $employee = $this->employeeService->updateEmployeeProfile($employee, $request->file('profile'));

        return ApiResponse::success(
            $employee,
            'Employee created successfully',
            201
        );
    }

    public function show($id){
        $employee = $this->employeeService->getEmployee($id);
        
        return ApiResponse::success(
            $employee,
            'Employee retrieved successfully'
        );
    }

    public function update(EmployeeRequest $request, string $id){
        $employee = Employee::findOrFail($id);
        $employee = $this->employeeService->updateEmployee($employee, $request->safe()->except('profile'));
        $employee = $this->employeeService->updateEmployeeProfile($employee, $request->file('profile'));

        return ApiResponse::success(
            $employee,
            'Employee updated successfully'
        );
    }

    public function toggleStatus(string $id){
        $employee = $this->employeeService->toggleStatus($id);
        
        return ApiResponse::success(
            [
                'id' => $employee->id,
                'name' => $employee->name,
                'employee_type_id' => $employee->employee_type_id,
                'employee_type' => $employee->employeeType,
                'email' => $employee->email,
                'contact_number' => $employee->contact_number,
                'active' => $employee->active
            ],
            'Employee status toggled successfully'
        );
    }

    public function batchStatus(EmployeeRequest $request){
        $employees = $this->employeeService->batchUpdateStatus(
            $request->validated('active_employee_ids')
        );

        return ApiResponse::success(
            $employees,
            'Employee statuses updated successfully'
        );
    }

    public function destroy(string $id){
        $this->employeeService->deleteEmployee($id);

        return ApiResponse::success(
            ['id' => (int) $id],
            'Employee deleted successfully'
        );
    }
}
