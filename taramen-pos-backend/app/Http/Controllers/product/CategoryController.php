<?php

namespace App\Http\Controllers\product;

use App\Helper\AttachUrl;
use App\Helper\FileUploadHelper;
use App\Http\Requests\CategoryRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use App\Http\Controllers\Controller;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {     
        $categories  = Category::all();
         $new_categ = $categories->map(function ($category) {
            return AttachUrl::attachUrl($category);
        });
        return ApiResponse::success(
            $new_categ,
            'Categories retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $file_uploaded = FileUploadHelper::upload($request->file('image'), 'categories');
            $data['image_id'] = $file_uploaded->id;
        }

        $category = Category::create($data);

        return ApiResponse::success(
            $category,
            'Category created successfully',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = Category::findOrFail($id);
        return ApiResponse::success(
            $category,
            'Category retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, string $id)
    {
        $category = Category::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($category->image_id) {
                Storage::disk('public')->delete($category->fileUpload?->file_path);
            }
            $file_uploaded = FileUploadHelper::upload($request->file('image'), 'categories');
            $data['image_id'] = $file_uploaded->id;
            
        }

        $category->update($data);
        
        return ApiResponse::success(
            $category,
            'Category updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = Category::findOrFail($id);

        $category->delete();

        return ApiResponse::success(
            $category,
            'Category deleted successfully'
        );
    }


  
}
