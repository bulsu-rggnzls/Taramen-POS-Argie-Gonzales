<?php

namespace Database\Seeders;

use App\Models\EmployeeType;
use Illuminate\Database\Seeder;

class EmployeeTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employeeTypes = [
            'Head Chef',
            'Assistant Chef',
            'Sushi Chef',
            'Cashier',
            'Waitress',
        ];

        foreach ($employeeTypes as $employeeType) {
            $type = EmployeeType::withTrashed()->firstOrCreate([
                'name' => $employeeType,
            ]);

            if ($type->trashed()) {
                $type->restore();
            }

            if (! $type->active) {
                $type->update(['active' => true]);
            }
        }
    }
}
