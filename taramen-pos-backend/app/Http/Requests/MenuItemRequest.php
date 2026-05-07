<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MenuItemRequest extends FormRequest
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
        $isBundle = filter_var($this->input('is_bundle', false), FILTER_VALIDATE_BOOLEAN);
        $currentMenuItemId = (int) ($this->route('id') ?? 0);

        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'available' => ['boolean'],
            'is_bundle' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'components' => [
                Rule::requiredIf(fn () => $isBundle),
                'array',
                'min:1',
            ],
            'components.*.menu_item_id' => [
                'required_with:components',
                'integer',
                Rule::exists('menu_items', 'id')->whereNull('deleted_at'),
                'distinct',
                function (string $attribute, mixed $value, \Closure $fail) use ($currentMenuItemId) {
                    if ($currentMenuItemId > 0 && (int) $value === $currentMenuItemId) {
                        $fail('A bundle cannot include itself as a component.');
                    }
                },
            ],
            'components.*.quantity' => ['required_with:components', 'integer', 'min:1'],
        ];
    }
}
