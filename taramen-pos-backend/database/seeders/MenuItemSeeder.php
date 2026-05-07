<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = $this->extractMenuRows();

        if ($rows === []) {
            return;
        }

        $duplicateMap = $this->buildDuplicateMap($rows);

        foreach ($rows as $row) {
            $category = Category::where('name', $row['category'])->first();

            if (!$category) {
                continue;
            }

            $itemName = $this->decorateNameIfDuplicate(
                $row['name'],
                $row['category'],
                $duplicateMap
            );

            $menuItem = MenuItem::withTrashed()->firstOrNew([
                'name' => $itemName,
                'category_id' => $category->id,
            ]);

            $menuItem->price = $row['price'];
            if (!$menuItem->exists) {
                $menuItem->available = true;
                $menuItem->image_id = null;
            }

            if ($menuItem->trashed()) {
                $menuItem->restore();
            }

            $menuItem->save();
        }
    }

    /**
     * @return list<array{category: string, name: string, price: float}>
     */
    private function extractMenuRows(): array
    {
        $path = base_path('../taramen_menu.md');

        if (!is_file($path)) {
            return [];
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES);
        $rows = [];
        $currentCategory = null;

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '') {
                continue;
            }

            if (preg_match('/^\*\*(.+?)\*\*(.*)$/u', $line, $headingMatches) === 1) {
                $currentCategory = trim($headingMatches[1] . ' ' . trim($headingMatches[2]));
                continue;
            }

            if (!$currentCategory) {
                continue;
            }

            if (preg_match('/^\*\s*(.+?)\s+[—-]\s*([\d,]+(?:\.\d+)?)$/u', $line, $itemMatches) !== 1) {
                continue;
            }

            $name = trim($itemMatches[1]);
            $price = (float) str_replace(',', '', $itemMatches[2]);

            $rows[] = [
                'category' => $currentCategory,
                'name' => $name,
                'price' => $price,
            ];
        }

        return $rows;
    }

    /**
     * @param list<array{category: string, name: string, price: float}> $rows
     * @return array<string, int>
     */
    private function buildDuplicateMap(array $rows): array
    {
        $map = [];

        foreach ($rows as $row) {
            $normalized = strtolower(trim($row['name']));
            $map[$normalized] = ($map[$normalized] ?? 0) + 1;
        }

        return $map;
    }

    /**
     * @param array<string, int> $duplicateMap
     */
    private function decorateNameIfDuplicate(
        string $name,
        string $category,
        array $duplicateMap
    ): string {
        $normalized = strtolower(trim($name));

        if (($duplicateMap[$normalized] ?? 0) > 1) {
            return sprintf('%s (%s)', $name, $category);
        }

        return $name;
    }
}
