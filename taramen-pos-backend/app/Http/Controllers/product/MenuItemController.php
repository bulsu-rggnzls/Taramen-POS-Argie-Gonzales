<?php

namespace App\Http\Controllers\product;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use App\Http\Requests\MenuItemRequest;
use App\Http\Responses\ApiResponse;
use App\Services\MenuItemService;

class MenuItemController extends Controller
{

    public function __construct(
        protected MenuItemService $menuItemService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $menuItems = $this->menuItemService->getAllItems();

        return ApiResponse::success(
            $menuItems,
            'Menu items retrieved successfully'
        );
    }

    public function available()
    {
        $menuItems = $this->menuItemService->getAvailableMenuItems();

        return ApiResponse::success(
            $menuItems,
            'Available menu items retrieved successfully'
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MenuItemRequest $request)
    {
        $menuItem = $this->menuItemService->createMenuItem($request->validated(), $request->file('image'));

        return ApiResponse::success(
            $menuItem,
            'Menu item created successfully',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $menuItem = $this->menuItemService->getMenuItem($id);

        return ApiResponse::success(
            $menuItem,
            'Menu item retrieved successfully'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MenuItemRequest $request, string $id)
    {
        $menuItem = MenuItem::findOrFail($id);

        $updateItem = $this->menuItemService->updateMenuItem(
            $menuItem,
            $request->validated(),
            $request->file('image'),
        );

        return ApiResponse::success(
            $updateItem,
            'Menu item updated successfully'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $menuItem = MenuItem::findOrFail($id);

        $this->menuItemService->archiveMenuItem($id);

        return ApiResponse::success(
            $menuItem,
            'Menu item archived successfully'
        );
    }

    public function restore($id)
    {
        $this->menuItemService->restoreMenuItem($id);

        return ApiResponse::success(
            ['id' => (int) $id],
            'Menu item restored successfully'
        );
    }

    public function toggleAvailability($id)
    {
        $menuItem = $this->menuItemService->toggleAvailability($id);

        return ApiResponse::success(
            [
                'id' => $menuItem->id,
                'available' => $menuItem->available
            ],
            'Menu item availability toggled successfully'
        );
    }
}
