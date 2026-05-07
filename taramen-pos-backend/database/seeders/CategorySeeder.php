<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->extractCategories() as $categoryName) {
            $category = Category::withTrashed()->firstOrNew([
                'name' => $categoryName,
            ]);

            if (!$category->exists) {
                $category->description = null;
            }

            if ($category->trashed()) {
                $category->restore();
            }

            $category->save();
        }
    }

    /**
     * @return list<string>
     */
    private function extractCategories(): array
    {
        $path = base_path('../taramen_menu.md');

        if (!is_file($path)) {
            return [];
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES);
        $categories = [];

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '') {
                continue;
            }

            if (preg_match('/^\*\*(.+?)\*\*(.*)$/u', $line, $matches) === 1) {
                $category = trim($matches[1] . ' ' . trim($matches[2]));

                if ($category !== '' && !in_array($category, $categories, true)) {
                    $categories[] = $category;
                }
            }
        }

        return $categories;
    }
}
