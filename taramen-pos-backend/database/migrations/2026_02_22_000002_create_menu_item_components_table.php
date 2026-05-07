<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menu_item_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bundle_menu_item_id')
                ->constrained('menu_items')
                ->cascadeOnDelete();
            $table->foreignId('component_menu_item_id')
                ->constrained('menu_items')
                ->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();

            $table->unique(['bundle_menu_item_id', 'component_menu_item_id'], 'menu_item_components_bundle_component_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_item_components');
    }
};
