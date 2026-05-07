<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class BundleMenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bundleSetCategory = $this->firstOrRestoreCategory('Bundle Set');
        $coupleSetCategory = $this->firstOrRestoreCategory('Couple Set');
        $bundleComponentsCategory = $this->firstOrRestoreCategory('Bundle Components');

        $bundleMenus = [
            [
                'category_id' => $bundleSetCategory->id,
                'name' => 'Tan-Tan',
                'price' => 445,
                'components' => [
                    ['name' => 'Tan-Tan', 'quantity' => 1],
                    ['name' => 'Gyoza', 'quantity' => 2],
                    ['name' => 'California Maki', 'quantity' => 4],
                ],
            ],
            [
                'category_id' => $bundleSetCategory->id,
                'name' => 'Shoyu Ramen',
                'price' => 445,
                'components' => [
                    ['name' => 'Shoyu', 'quantity' => 1],
                    ['name' => 'Gyoza', 'quantity' => 2],
                    ['name' => 'California Maki', 'quantity' => 4],
                ],
            ],
            [
                'category_id' => $bundleSetCategory->id,
                'name' => 'Chicken Tepanyaki Ramen',
                'price' => 445,
                'components' => [
                    ['name' => 'Chicken Teppanyaki', 'quantity' => 1],
                    ['name' => 'Gyoza', 'quantity' => 2],
                    ['name' => 'California Maki', 'quantity' => 4],
                ],
            ],
            [
                'category_id' => $coupleSetCategory->id,
                'name' => 'Set A',
                'price' => 611,
                'components' => [
                    ['name' => 'Katsudon', 'quantity' => 1],
                    ['name' => 'Chicken Teriyaki Don', 'quantity' => 1],
                    ['name' => 'Kani Salad', 'quantity' => 1],
                    ['name' => 'Shoyu Soup', 'quantity' => 2],
                    ['name' => 'Glass of Iced Tea', 'quantity' => 2],
                ],
            ],
            [
                'category_id' => $coupleSetCategory->id,
                'name' => 'Set B',
                'price' => 746,
                'components' => [
                    ['name' => 'Tan-Tan', 'quantity' => 1],
                    ['name' => 'Taramen', 'quantity' => 1],
                    ['name' => 'Gyoza', 'quantity' => 5],
                    ['name' => 'California Maki', 'quantity' => 1],
                    ['name' => 'Glass of Iced Tea', 'quantity' => 2],
                ],
            ],
        ];

        foreach ($bundleMenus as $bundleMenu) {
            $menuItem = MenuItem::withTrashed()->firstOrNew([
                'name' => $bundleMenu['name'],
                'category_id' => $bundleMenu['category_id'],
            ]);

            $menuItem->price = $bundleMenu['price'];
            $menuItem->available = true;
            $menuItem->is_bundle = true;

            if ($menuItem->trashed()) {
                $menuItem->restore();
            }

            $menuItem->save();

            $syncPayload = [];
            foreach ($bundleMenu['components'] as $component) {
                $componentItem = $this->resolveComponentItem(
                    $component['name'],
                    $bundleComponentsCategory
                );

                $syncPayload[$componentItem->id] = [
                    'quantity' => $component['quantity'],
                ];
            }

            $menuItem->bundleComponents()->sync($syncPayload);
        }
    }

    private function firstOrRestoreCategory(string $name): Category
    {
        $category = Category::withTrashed()->firstOrNew(['name' => $name]);

        if (!$category->exists) {
            $category->description = null;
        }

        if ($category->trashed()) {
            $category->restore();
        }

        $category->save();

        return $category;
    }

    private function resolveComponentItem(string $inputName, Category $fallbackCategory): MenuItem
    {
        $candidateNames = $this->componentNameCandidates($inputName);

        foreach ($candidateNames as $candidateName) {
            $menuItem = MenuItem::where('name', $candidateName)
                ->where('is_bundle', false)
                ->first();
            if ($menuItem) {
                return $menuItem;
            }
        }

        $fallback = MenuItem::withTrashed()->firstOrNew([
            'name' => $inputName,
            'category_id' => $fallbackCategory->id,
        ]);

        if (!$fallback->exists) {
            $fallback->price = 0;
            $fallback->available = false;
            $fallback->is_bundle = false;
            $fallback->image_id = null;
        }

        if ($fallback->trashed()) {
            $fallback->restore();
        }

        $fallback->save();

        return $fallback;
    }

    /**
     * @return list<string>
     */
    private function componentNameCandidates(string $name): array
    {
        $aliases = [
            'Tan-Tan' => ['Tan-tan'],
            'Shoyu' => ['Shoyu Ramen'],
            'Chicken Teppanyaki' => ['Spicy Chicken Teppanyaki'],
            'Gyoza' => ['Pork Gyoza', 'Pork Age Gyoza'],
            'California Maki' => ['California Roll', 'California Ebi'],
            'Katsudon' => ['Pork Katsudon', 'Chicken Katsudon'],
            'Kani Salad' => ['Kani Salad (Salad)', 'Kani Salad (Party Platter)'],
            'Taramen' => ['Ta’ramen', "Ta'ramen"],
        ];

        return array_values(array_unique(array_merge(
            [$name],
            $aliases[$name] ?? []
        )));
    }
}
