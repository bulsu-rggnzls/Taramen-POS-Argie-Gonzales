<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DiscountTypeRequest extends FormRequest
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
        $discountId = $this->route('discount_type') ?? $this->route('discount_types');

        $rules = [
            "name" => ["required", "string", "max:255", Rule::unique("discount_types", "name")->ignore($discountId)],

        ];
        return $rules;
    }

    public function messages() : array
    {
        return [
            "name.required" => "The name cannot be empty"
        ];
    }
}
