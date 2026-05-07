<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Discount extends Model
{
    protected $fillable = [
        'name',
        'discount_type_id',
        'value',
        'active'
    ];

    protected $casts = [
        'active' => 'boolean',
        'value' => 'decimal:2'
    ];

    public function menuItems() : BelongsToMany {
        return $this->belongsToMany(MenuItem::class, 'discount_items')->withTimestamps();
    }

    public function discountType(): BelongsTo {
        return $this->belongsTo(DiscountType::class);
    }

}
