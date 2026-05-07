<?php

namespace Database\Seeders;

use App\Models\DiscountType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DiscountTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $discount_types = ['percentage', 'fixed', 'buy1take1'];

        foreach ($discount_types as $discount_type) {
            $type = DiscountType::withTrashed()->firstOrCreate([
                'name' => $discount_type,
            ]);

            if ($type->trashed()) {
                $type->restore();
            }
        }
    }
}
