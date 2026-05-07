<?php

namespace App\Http\Controllers\product;

use App\Http\Requests\DiscountRequest;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Discount;
use App\Services\DiscountService;


class DiscountController extends Controller
{

    public function __construct(protected DiscountService $discountService)
    {
    }

    public function index()
    {
       $discounts = $this->discountService->getAllDiscount();

       return ApiResponse::success(
            $discounts,
            'Discounts fetched successfully'
        );
    }

    public function getAllActive(){
        $active_discounts = $this->discountService->getAllActiveDiscounts();

        return ApiResponse::success(
            $active_discounts,
            'Active discounts have been fetched successfully'
        );

    }



    public function store(DiscountRequest $request)
    {
        $created_discount = $this->discountService->createDiscount($request);

        return ApiResponse::success(
            $created_discount,
            'Discount has been created successfully',
            201
        );

    }


    public function show($id)
    {
        $discount = $this->discountService->getOneDiscount($id);
        return ApiResponse::success(
            $discount,
            'Discount found'
        );
    }


    public function update(DiscountRequest $request,  $id)
    {
        $discount = Discount::findOrFail($id);
        $validated_data = $request->validated();
        $updated_discount = $this->discountService->updateDiscount($discount, $validated_data);

        return ApiResponse::success(
            $updated_discount,
            'Discount has been updated successfully',
            201
        );

    }

    public function destroy( $id)
    {
        $discount = $this->discountService->deleteDiscount($id);
        return ApiResponse::success(
            $discount,
            'Discount deleted successfully'
        );

    }
}
