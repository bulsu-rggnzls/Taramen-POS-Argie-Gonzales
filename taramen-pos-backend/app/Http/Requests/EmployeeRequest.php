<?php

namespace App\Http\Requests;

use App\Models\Employee;
use App\Models\EmployeeType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class EmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->routeIs('employees.batchStatus')) {
            return [
                'active_employee_ids' => ['present', 'array'],
                'active_employee_ids.*' => [
                    'integer',
                    'distinct',
                    Rule::exists('employees', 'id')->whereNull('deleted_at'),
                ],
            ];
        }

        $isStore = $this->routeIs('employees.store');
        $employeeId = $this->route('employee');
        $emailRule = Rule::unique('employees', 'email');
        $employeeTypeRule = Rule::exists('employee_types', 'id')->whereNull('deleted_at');

        if ($this->routeIs('employees.update')) {
            $emailRule->ignore($employeeId);
        }

        if ($isStore) {
            $employeeTypeRule->where('active', true);
        }

        return [
            'name' => [$isStore ? 'required' : 'sometimes', 'string', 'max:255'],
            'employee_type_id' => [
                $isStore ? 'required' : 'sometimes',
                'integer',
                $employeeTypeRule,
            ],
            'email' => [
                'sometimes',
                'nullable',
                'email',
                'max:255',
                $emailRule,
            ],
            'contact_number' => ['sometimes', 'nullable', 'string', 'max:30'],
            'active' => ['sometimes', 'boolean'],
            'profile' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->routeIs('employees.update')) {
                return;
            }

            if ($this->hasAny(['name', 'employee_type_id', 'email', 'contact_number', 'active']) || $this->hasFile('profile')) {
                return;
            }

            $validator->errors()->add(
                'fields',
                'At least one valid employee field is required.'
            );
        });

        $validator->after(function (Validator $validator) {
            if (! $this->routeIs('employees.update') || ! $this->has('employee_type_id')) {
                return;
            }

            if ($validator->errors()->has('employee_type_id')) {
                return;
            }

            $employeeId = $this->route('employee');
            $employee = $employeeId instanceof Employee ? $employeeId : Employee::find($employeeId);
            $employeeTypeId = (int) $this->input('employee_type_id');
            $employeeType = EmployeeType::find($employeeTypeId);

            if (! $employee || ! $employeeType || $employeeType->active || (int) $employee->employee_type_id === $employeeTypeId) {
                return;
            }

            $validator->errors()->add(
                'employee_type_id',
                'The selected employee type is inactive.'
            );
        });
    }
}
