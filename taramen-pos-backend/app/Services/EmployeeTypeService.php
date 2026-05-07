<?php

namespace App\Services;

use App\Models\EmployeeType;
use Illuminate\Validation\ValidationException;

class EmployeeTypeService
{
    public function listActive()
    {
        return EmployeeType::where('active', true)->orderBy('name')->get();
    }

    public function listAll()
    {
        return EmployeeType::orderBy('name')->get();
    }

    public function create(array $data): EmployeeType
    {
        if (! array_key_exists('active', $data)) {
            $data['active'] = true;
        }

        return EmployeeType::create($data);
    }

    public function get($id): EmployeeType
    {
        return EmployeeType::findOrFail($id);
    }

    public function update(EmployeeType $employeeType, array $data): EmployeeType
    {
        $employeeType->update($data);

        return $employeeType;
    }

    public function toggleStatus($id): EmployeeType
    {
        $employeeType = EmployeeType::findOrFail($id);
        $employeeType->active = ! $employeeType->active;
        $employeeType->save();

        return $employeeType;
    }

    public function delete($id): void
    {
        $employeeType = EmployeeType::findOrFail($id);

        if ($employeeType->employees()->exists()) {
            throw ValidationException::withMessages([
                'employee_type' => [
                    'Cannot delete employee type because employees are assigned to it. Reassign or archive assigned employees before deleting this employee type.',
                ],
            ]);
        }

        $employeeType->delete();
    }
}
