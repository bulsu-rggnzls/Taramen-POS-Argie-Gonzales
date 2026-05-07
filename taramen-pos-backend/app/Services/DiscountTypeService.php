<?php

namespace App\Services;

use App\Http\Requests\DiscountTypeRequest;
use App\Models\Discount;
use App\Models\DiscountType;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

use function Illuminate\Log\log;

class DiscountTypeService {



    public function createDiscountType ( $request) {
        $discount_type = $request->validated();
        $newly_created = DiscountType::create($discount_type);
        return $newly_created;
    }

    public function updateDiscountType( $request, $id) {
        $discount_type = DiscountType::findOrFail($id);
        $discount_type->update($request->validated());

        return $discount_type;


    }

    public function getDiscountTypes() {

        $discount_types = DiscountType::all();

        return $discount_types;
    }

    public function deleteDiscountType($id) {
       $discount_type = DiscountType::findOrFail($id);
       $discount_name = $discount_type->name;
       $discount_type->delete();

       return $discount_name;
    }
}
