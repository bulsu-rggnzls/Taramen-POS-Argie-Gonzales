<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'employee_id',
        'table_number',
        'status',
        'subtotal',
        'total_discount',
        'special_request',
        'total_amount',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class)->withTrashed();
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateOrderNumber()
    {
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;

        return $date . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    public function calculateTotalAmount()
    {
        $this->subtotal = $this->orderItems()->sum('subtotal');
        $this->total_discount = $this->orderItems()->sum('discount_amount');
        $this->total_amount = $this->orderItems()->sum('total_amount');
    }
}
