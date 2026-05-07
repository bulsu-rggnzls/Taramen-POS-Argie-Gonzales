<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Discount;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService{

    public function getAllOrders(){
        return Order::with('orderItems', 'employee')->latest()->get();
    }

    public function getFilteredOrders($filters = [], $perPage = 10){
        $query = Order::with('orderItems', 'employee');

        if(isset($filters['status'])){
            $query->where('status', $filters['status']);
        }

        if(isset($filters['employee_id'])){
            $query->where('employee_id', $filters['employee_id']);
        }

        if(isset($filters['table_number'])){
            $query->where('table_number', $filters['table_number']);
        }

        if(isset($filters['date_from'])){
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if(isset($filters['date_to'])){
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if(isset($filters['today']) && $filters['today']){
            $query->whereDate('created_at', today());
        }

        return $query->latest()->paginate($perPage);
    }


    public function createOrder($request){

        return DB::transaction(function () use ($request) {
            $validated_data = $request->validated();
            $notAvailable = [];

            foreach ($validated_data['items'] as $index => $item) {
                $menuItem = MenuItem::where('id' , $item['menu_item_id'])->first();
                    if($menuItem->is_bundle == 1){
                       $componentItems= $menuItem->bundleComponents()->where('available', 0)->pluck('name')->toArray();
                       $notAvailable = array_merge($notAvailable, $componentItems);
                    }else{
                        if($menuItem->available == 0){
                            $notAvailable[] = $menuItem->name;
                        }
                    }

            }
            if (count($notAvailable) > 0) {
                throw ValidationException::withMessages([
                    'items' => [
                        'The following menu items are not available: ' . implode(', ', $notAvailable),
                    ],
                ]);

            }

            $order = Order::create([
                'order_number' => Order::generateOrderNumber(),
                'employee_id' => $validated_data['employee_id'],
                'table_number' => $validated_data['table_number'],
                'status' => 'pending',
                'subtotal' => 0,
                'total_discount' => 0,
                'total_amount' => 0,
                'special_request' => $validated_data['special_request'] ?? null,
            ]);

            foreach ($validated_data['items'] as $index => $item) {
                $menuItem = MenuItem::where('id' , $item['menu_item_id'])->first();
                    if(count($notAvailable) == 0){
                        $this->createOrderItem($order, $item, $index);
                    }
            }



            $order->calculateTotalAmount();
            $order->save();

            return $order->load('orderItems', 'employee');
        });
    }

    private function createOrderItem($order, $item, int $index = 0){
        $menuItem = MenuItem::findOrFail($item['menu_item_id']);

        $discount = null;
        $discountName = null;
        $discountType = null;
        $discountAmount = 0;

        if(isset($item['discount_id'])){
            $discount = Discount::with(['discountType', 'menuItems'])
                ->find($item['discount_id']);

            if (! $discount?->active) {
                throw ValidationException::withMessages([
                    "items.{$index}.discount_id" => [
                        'The selected discount is inactive or unavailable.',
                    ],
                ]);
            }

            if ($discount && !$discount->menuItems->contains('id', $menuItem->id)) {
                throw ValidationException::withMessages([
                    "items.{$index}.discount_id" => [
                        'This discount cannot be applied to the selected menu item.',
                    ],
                ]);
            }

            if ($discount) {
                $discountName = $discount->name;
                $discountType = $discount->discountType?->name;

                if (!in_array($discountType, ['percentage', 'fixed', 'buy1take1'], true)) {
                    throw ValidationException::withMessages([
                        "items.{$index}.discount_id" => [
                            'The selected discount type is not supported.',
                        ],
                    ]);
                }
            }
        }

        $subtotal = $menuItem->price * $item['quantity'];

        if ($discount) {
            if ($discountType === 'percentage') {
                $discountAmount = ($subtotal * $discount->value) / 100;
            } elseif ($discountType === 'fixed') {
                $discountAmount = min($subtotal, $discount->value);
            } elseif ($discountType === 'buy1take1') {
                $freeQuantity = floor($item['quantity'] / 2);
                $discountAmount = $freeQuantity * $menuItem->price;
            }
        }

        $totalAmount = $subtotal - $discountAmount;

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'menu_item_id' => $menuItem->id,
            'item_name' => $menuItem->name,
            'unit_price' => $menuItem->price,
            'quantity' => $item['quantity'],
            'subtotal' => $subtotal,
            'discount_id' => $discount ? $discount->id : null,
            'discount_name' => $discountName,
            'discount_type' => $discountType,
            'discount_amount' => $discountAmount,
            'total_amount' => $totalAmount,
        ]);

        return $orderItem;
    }

    public function getOrder($id){
        return Order::with('orderItems', 'employee')->findOrFail($id);
    }

    public function getReceipt($id){
        $order = Order::with(['orderItems', 'employee'])->findOrFail($id);

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'created_at' => $order->created_at?->toDateTimeString(),
            'table_number' => $order->table_number,
            'status' => $order->status,
            'employee' => [
                'id' => $order->employee?->id,
                'name' => $order->employee?->name,
            ],
            'items' => $order->orderItems->map(function ($item) {
                return [
                    'menu_item_id' => $item->menu_item_id,
                    'item_name' => $item->item_name,
                    'unit_price' => $item->unit_price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->subtotal,
                    'discount_id' => $item->discount_id ?? null,
                    'discount_name' => $item->discount_name,
                    'discount_type' => $item->discount_type,
                    'discount_amount' => $item->discount_amount,
                    'total_amount' => $item->total_amount,
                ];
            })->values(),
            'totals' => [
                'subtotal' => $order->subtotal,
                'total_discount' => $order->total_discount,
                'total_amount' => $order->total_amount,
            ],
        ];
    }

   public function updateOrder($id, $request){
    $order = Order::findOrFail($id);
    $validated_data = $request->validated();
    $order->update($validated_data);
    $order->orderItems()->delete();
    foreach($validated_data['items'] as $index => $item) {
        $this->createOrderItem($order, $item, $index);
    }

    $order->calculateTotalAmount();
    $order->save();

    return $order->fresh(['orderItems', 'employee']);
}

    public function updateOrderStatus($id, $status){
        $order = Order::findOrFail($id);
        $order->update(['status' => $status]);
        return $order->fresh(['orderItems', 'employee']);
    }

    public function deleteOrder($id){
        $order = Order::findOrFail($id);

        if ($order->status === 'completed'){
            throw ValidationException::withMessages([
                'status' => ['Order cannot be deleted because it is completed.'],
            ]);
        }

        $order->delete();

        return $order;
    }

    public function getOrderStats($filters = []){
        $query = Order::query();

        if (isset($filters['date_from'])){
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])){
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['today']) && $filters['today']){
            $query->whereDate('created_at', today());
        }

        return [
            'total_orders' => (clone $query)->count(),
            'pending_orders' => (clone $query)->where('status', 'pending')->count(),
            'completed_orders' => (clone $query)->where('status', 'completed')->count(),
            'cancelled_orders' => (clone $query)->where('status', 'cancelled')->count(),
            'total_sales' => (clone $query)->where('status', 'completed')->sum('total_amount'),
            'total_discounts' => (clone $query)->where('status', 'completed')->sum('total_discount'),
        ];
    }
}
