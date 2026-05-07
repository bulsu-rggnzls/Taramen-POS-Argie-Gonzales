<?php

namespace App\Http\Controllers\product;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiscountTypeRequest;
use App\Http\Responses\ApiResponse;
use App\Services\DiscountTypeService;

class DiscountTypeController extends Controller
{


    public function __construct(protected DiscountTypeService $discountTypeService){
        $this->discountTypeService = $discountTypeService;
    }

    public function getDiscountTypes(){

        $discountTypes = $this->discountTypeService->getDiscountTypes();
        return ApiResponse::success(
            $discountTypes,
            'Discount types fetched successfully',
        );

    }

    public function createDiscountTypes(DiscountTypeRequest $request){
        $discountType = $this->discountTypeService->createDiscountType($request);

        return ApiResponse::success(
            $discountType,
            'Discount type created successfully',
        );

    }
    public function updateDiscountTypes(DiscountTypeRequest $request, $id ){

        $discountType = $this->discountTypeService->updateDiscountType($request, $id);


        return ApiResponse::success(
            $discountType,
            'Discount type updated successfully',
        );
    }
    public function deleteDiscountTypes($id ){

        $discountType = $this->discountTypeService->deleteDiscountType($id);
        return  ApiResponse::success(
            $discountType,
            'Discount type deleted successfully',
        );

    }
}
