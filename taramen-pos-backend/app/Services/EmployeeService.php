<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EmployeeService
{
    public function listActiveEmployees(){
        return Employee::with('employeeType')->where('active', true)->get();
    }

    public function getAllEmployees(){
        return Employee::with('employeeType')->get();
    }

    public function createEmployee(array $data){
        if (!array_key_exists('active', $data)) {
            $data['active'] = true;
        }

        return Employee::create($data)->load('employeeType');
    }

    public function getEmployee($id){
        return Employee::with('employeeType')->findOrFail($id);
    }

    public function updateEmployee(Employee $employee, array $data){
        $employee->update($data);
        return $employee->load('employeeType');
    }

    public function updateEmployeeProfile(Employee $employee, ?UploadedFile $profile = null): Employee
    {
        if (!$profile) {
            return $employee->load('employeeType');
        }

        if ($employee->profile) {
            Storage::disk('public')->delete($employee->profile);
        }

        $employee->update([
            'profile' => $profile->store('employees', 'public'),
        ]);

        return $employee->load('employeeType');
    }

    public function toggleStatus($id){
        $employee = Employee::findOrFail($id);

        $employee->active = ! $employee->active;
        $employee->save();

        return $employee->load('employeeType');
    }

    public function batchUpdateStatus(array $activeEmployeeIds): array
    {
        return DB::transaction(function () use ($activeEmployeeIds) {
            Employee::query()->update(['active' => false]);

            if (! empty($activeEmployeeIds)) {
                Employee::whereIn('id', $activeEmployeeIds)->update(['active' => true]);
            }

            return [
                'active_employees' => Employee::with('employeeType')
                    ->where('active', true)
                    ->orderBy('name')
                    ->get(),
                'inactive_employees' => Employee::with('employeeType')
                    ->where('active', false)
                    ->orderBy('name')
                    ->get(),
            ];
        });
    }

    public function deleteEmployee($id){
        $employee = Employee::findOrFail($id);

        $employee->delete();
    }
}
