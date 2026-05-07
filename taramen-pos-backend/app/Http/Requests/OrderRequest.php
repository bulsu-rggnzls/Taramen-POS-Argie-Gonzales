<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
        $isStatusUpdate = $this->routeIs('*.updateStatus');

        if ($isStatusUpdate) {
            return [
                'status' => 'required|string|in:pending,completed,cancelled'
            ];
        }

        $isStore = $this->isMethod('post');
        $isGetStats = $this->isMethod('get');

        $rules = [
            'employee_id' => [
                $isStore ? 'required' : 'sometimes',
                'integer',
                'exists:employees,id'
            ],
            'table_number' => [
                $isStore ? 'required' : 'sometimes',
                'string',
                'max:50'
            ],
            'status' => [ 'sometimes', 'in:pending,completed,cancelled' ],

            'date_from' => [ 'sometimes', 'date' ],
            'date_to' => [ 'sometimes', 'date', 'after_or_equal:date_from' ],
            'today' => [ 'sometimes', 'boolean' ],

            'per_page' => [ 'sometimes', 'integer', 'min:1', 'max:100' ],

            "special_request" => [ 'nullable', 'string', 'max:255' ],

            'items' => [ $isStore ? 'required' : 'sometimes', 'array', 'min:1' ],
            'items.*.menu_item_id' => [ $isStore ? 'required' : 'sometimes', 'integer', 'exists:menu_items,id' ],
            'items.*.quantity' => [ $isStore ? 'required' : 'sometimes', 'integer', 'min:1' ],
            'items.*.discount_id' => [ 'sometimes', 'integer', 'exists:discounts,id' ],

        ];

        return $rules;
    }
}
