<?php

namespace App\Http\Controllers\product;

use App\Http\Controllers\Controller;
use App\Models\FilesUpload;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function getMenuItemImage($storage_filename){
        $fileRecord = FilesUpload::where("storage_filename" ,$storage_filename)->first();

        if (!$fileRecord) {
            abort(404, 'File record not found');
        }

        $path = $fileRecord->file_path;

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'menu_item image not found');
        }

        $file = Storage::disk('public')->get($path);
        $mime = Storage::disk('public')->mimeType($path);


        return response($file, 200)->header('Content-Type', $mime);
    }
}
