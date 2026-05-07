<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function summaryService(string $start, string $end): array
    {
        $query = $this->completedOrdersQuery($start, $end);

        return [
            'total_orders' => (clone $query)->count(),
            'subtotal' => $this->formatMoney((clone $query)->sum('subtotal')),
            'total_discount' => $this->formatMoney((clone $query)->sum('total_discount')),
            'total_amount' => $this->formatMoney((clone $query)->sum('total_amount')),
        ];
    }

    public function employeeService(string $start, string $end)
    {
        [$startDate, $endDate] = $this->dateRange($start, $end);

        return Order::query()
            ->join('employees', 'orders.employee_id', '=', 'employees.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select([
                'employees.id as employee_id',
                'employees.name as employee_name',
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('COALESCE(SUM(orders.subtotal), 0) as subtotal'),
                DB::raw('COALESCE(SUM(orders.total_discount), 0) as total_discount'),
                DB::raw('COALESCE(SUM(orders.total_amount), 0) as total_amount'),
            ])
            ->groupBy('employees.id', 'employees.name')
            ->orderByDesc('total_amount')
            ->get()
            ->map(fn ($row) => [
                'employee_id' => $row->employee_id,
                'employee_name' => $row->employee_name,
                'total_orders' => (int) $row->total_orders,
                'subtotal' => $this->formatMoney($row->subtotal),
                'total_discount' => $this->formatMoney($row->total_discount),
                'total_amount' => $this->formatMoney($row->total_amount),
            ])
            ->values();
    }

    public function topItemService(string $start, string $end)
    {
        [$startDate, $endDate] = $this->dateRange($start, $end);

        return OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select([
                'order_items.menu_item_id',
                'order_items.item_name',
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count'),
                DB::raw('COALESCE(SUM(order_items.quantity), 0) as total_quantity'),
                DB::raw('COALESCE(SUM(order_items.subtotal), 0) as subtotal'),
                DB::raw('COALESCE(SUM(order_items.discount_amount), 0) as total_discount'),
                DB::raw('COALESCE(SUM(order_items.total_amount), 0) as total_amount'),
            ])
            ->groupBy('order_items.menu_item_id', 'order_items.item_name')
            ->orderByDesc('total_quantity')
            ->orderByDesc('total_amount')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'menu_item_id' => $row->menu_item_id,
                'item_name' => $row->item_name,
                'order_count' => (int) $row->order_count,
                'total_quantity' => (int) $row->total_quantity,
                'subtotal' => $this->formatMoney($row->subtotal),
                'total_discount' => $this->formatMoney($row->total_discount),
                'total_amount' => $this->formatMoney($row->total_amount),
            ])
            ->values();
    }

    private function completedOrdersQuery(string $start, string $end)
    {
        [$startDate, $endDate] = $this->dateRange($start, $end);

        return Order::query()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);
    }

    private function dateRange(string $start, string $end): array
    {
        return [
            Carbon::parse($start)->startOfDay(),
            Carbon::parse($end)->endOfDay(),
        ];
    }

    private function formatMoney(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
