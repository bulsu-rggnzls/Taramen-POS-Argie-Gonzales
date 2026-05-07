<?php

namespace App\Http\Controllers\product;

use App\Exports\ReceiptExport;
use App\Http\Controllers\Controller;
use App\Services\OrderService;
use App\Http\Requests\OrderRequest;
use App\Http\Responses\ApiResponse;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index(OrderRequest $request)
    {
        $filter = $request->validated();

        $perPage = $request->input('per_page', 10);
        $orders = $this->orderService->getFilteredOrders($filter, $perPage);

        return ApiResponse::success(
            $orders,
            'Orders retrieved successfully'
        );
    }

    public function store(OrderRequest $request)
    {
        $order = $this->orderService->createOrder($request);

        return ApiResponse::success(
            $order,
            'Order created successfully',
            201
        );
    }


    public function show($id)
    {
        $order = $this->orderService->getOrder($id);

        return ApiResponse::success(
            $order,
            'Order retrieved successfully'
        );
    }

    public function receipt($id)
    {
        $receipt = $this->orderService->getReceipt($id);

        return ApiResponse::success(
            $receipt,
            'Receipt retrieved successfully'
        );
    }


    public function update(OrderRequest $request, $id)
    {
        $order = $this->orderService->updateOrder($id, $request);

        return ApiResponse::success(
            $order,
            'Order updated successfully'
        );
    }

    public function updateStatus(OrderRequest $request, $id)
    {
        $order = $this->orderService->updateOrderStatus($id, $request->status);

        return ApiResponse::success(
            $order,
            'Order status updated successfully'
        );
    }


    public function destroy($id)
    {
        $order = $this->orderService->deleteOrder($id);

        return ApiResponse::success(
            $order,
            'Order deleted successfully'
        );
    }

    public function stats(OrderRequest $request)
    {
        $filter = $request->validated();

        $stats = $this->orderService->getOrderStats($filter);

        return ApiResponse::success(
            $stats,
            'Order stats retrieved successfully'
        );
    }

    public function printReceipt() {
        $printReceipt = new ReceiptExport();
        return $printReceipt->generate();
    }
}
