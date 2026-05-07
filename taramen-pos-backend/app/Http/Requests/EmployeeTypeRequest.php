<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class EmployeeTypeRequest extends FormRequest
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
        $isStore = $this->routeIs('employee-types.store');
        $employeeTypeId = $this->route('employee_type');

        return [
            'name' => [
                $isStore ? 'required' : 'sometimes',
                'string',
                'max:255',
                Rule::unique('employee_types', 'name')->ignore($employeeTypeId),
            ],
            'active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->routeIs('employee-types.update')) {
                return;
            }

            if ($this->hasAny(['name', 'active'])) {
                return;
            }

            $validator->errors()->add(
                'fields',
                'At least one valid employee type field is required.'
            );
        });
    }
}
