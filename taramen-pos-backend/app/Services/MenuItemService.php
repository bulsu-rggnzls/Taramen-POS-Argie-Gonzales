<?php

namespace App\Services;

use App\Models\FilesUpload;
use App\Models\MenuItem;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Helper\FileUploadHelper;

class MenuItemService {


    public function getAllItems(){
        $menuItems = MenuItem::with(['category', 'bundleComponents.category', 'fileUpload'])->get();

        return $menuItems->map(fn (MenuItem $menuItem) => $this->attachTemporaryImageUrl($menuItem));
    }
    public function getAvailableMenuItems(){
        $menuItems = MenuItem::with(['category', 'bundleComponents.category', 'fileUpload'])
            ->where('available', true)
            ->get();

        return $menuItems->map(fn (MenuItem $menuItem) => $this->attachTemporaryImageUrl($menuItem));
    }

    public function createMenuItem(array $data, ?UploadedFile $image = null){
        return DB::transaction(function () use ($data, $image) {
            $components = $data['components'] ?? [];
            unset($data['components']);

            $data['is_bundle'] = (bool) ($data['is_bundle'] ?? false);

            if ($image){
                $file_uploaded = FileUploadHelper::upload($image, 'menu_items');
                $data['image_id'] = $file_uploaded->id;
            }

            $menuItem = MenuItem::create($data);

            if ($menuItem->is_bundle) {

                $this->syncBundleComponents($menuItem, $components);
            }

            $menuItem = $menuItem->fresh(['category', 'bundleComponents.category', 'fileUpload']);

            return $this->attachTemporaryImageUrl($menuItem);
        });
    }

    public function getMenuItem($id){
        $menuItem = MenuItem::withTrashed()
            ->with(['category', 'bundleComponents.category', 'fileUpload'])
            ->findOrFail($id);

        return $this->attachTemporaryImageUrl($menuItem);
    }

    public function updateMenuItem(MenuItem $menuItem, array $data, ?UploadedFile $image = null){
        return DB::transaction(function () use ($menuItem, $data, $image) {
            $hasComponents = array_key_exists('components', $data);
            $components = $data['components'] ?? [];
            unset($data['components']);

            if ($image){
                if ($menuItem->fileUpload?->file_path) {
                    Storage::disk('public')->delete($menuItem->fileUpload->file_path);
                }
                $file_uploaded = FileUploadHelper::upload($image, 'menu_items');
                $data['image_id'] = $file_uploaded->id;
            }
            $willBeBundle = array_key_exists('is_bundle', $data)
                ? (bool) $data['is_bundle']
                : (bool) $menuItem->is_bundle;

            if ($hasComponents && !$willBeBundle) {
                throw ValidationException::withMessages([
                    'components' => ['Components are only allowed for bundle items.'],
                ]);
            }

            $menuItem->update($data);

            if (!$willBeBundle) {
                $menuItem->bundleComponents()->detach();
            } elseif ($hasComponents) {
                $this->syncBundleComponents($menuItem, $components);
            }

            $menuItem = $menuItem->fresh(['category', 'bundleComponents.category', 'fileUpload']);

            return $this->attachTemporaryImageUrl($menuItem);
        });
    }

    public function archiveMenuItem($id){
        $menuItem = MenuItem::withTrashed()->findOrFail($id);

        $menuItem->delete();

        $menuItem->update([
            'available' => false
        ]);
    }

    public function restoreMenuItem($id){
        $menuItem = MenuItem::withTrashed()->findOrFail($id);

        $menuItem->restore();

        $menuItem->update([
            'available' => true
        ]);
    }

    public function toggleAvailability($id){
        $menuItem = MenuItem::withTrashed()->findOrFail($id);
        $menuItem->available = !$menuItem->available;
        $menuItem->save();

        return $menuItem;
    }

    /**
     * @param list<array{menu_item_id: int, quantity: int}> $components
     */
    private function syncBundleComponents(MenuItem $bundleMenuItem, array $components): void
    {
        if (empty($components)) {
            $bundleMenuItem->bundleComponents()->detach();
            return;
        }

        $syncPayload = [];

        foreach ($components as $component) {
            $componentId = (int) ($component['menu_item_id'] ?? 0);
            $quantity = (int) ($component['quantity'] ?? 0);

            if ($componentId <= 0 || $quantity <= 0) {
                continue;
            }

            if ($componentId === (int) $bundleMenuItem->id) {
                throw ValidationException::withMessages([
                    'components' => ['A bundle cannot include itself as a component.'],
                ]);
            }

            if (isset($syncPayload[$componentId])) {
                $syncPayload[$componentId]['quantity'] += $quantity;
                continue;
            }

            $syncPayload[$componentId] = ['quantity' => $quantity];
        }

        $bundleMenuItem->bundleComponents()->sync($syncPayload);
    }

    private function attachTemporaryImageUrl(MenuItem $menuItem, int $expiresInMinutes = 15): MenuItem
    {
        $storageFilename = $menuItem->fileUpload?->storage_filename;

        if (!$storageFilename) {
            $menuItem->setAttribute('image_url', null);
            return $menuItem;
        }

        $signedUrl = URL::temporarySignedRoute(
            'secure.menu.image.signed',
            now()->addMinutes($expiresInMinutes),
            ['storage_filename' => $storageFilename]
        );

        $menuItem->setAttribute('image_url', $signedUrl);

        return $menuItem;
    }
}
