<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuItem extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'name',
        'price',
        'category_id',
        'available',
        'is_bundle',
        'image_id',
    ];

    protected $casts = [
        'available' => 'boolean',
        'is_bundle' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function discount(): BelongsToMany
    {
        return $this->belongsToMany(Discount::class, 'discount_items');
    }

    public function fileUpload() {
        return $this->belongsTo(FilesUpload::class, "image_id", "id");
    }

    public function bundleComponents(): BelongsToMany
    {
        return $this->belongsToMany(
            MenuItem::class,
            'menu_item_components',
            'bundle_menu_item_id',
            'component_menu_item_id'
        )->withPivot('quantity')->withTimestamps();
    }

    public function usedInBundles(): BelongsToMany
    {
        return $this->belongsToMany(
            MenuItem::class,
            'menu_item_components',
            'component_menu_item_id',
            'bundle_menu_item_id'
        )->withPivot('quantity')->withTimestamps();
    }
}
