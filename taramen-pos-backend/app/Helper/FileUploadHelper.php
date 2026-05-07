<?php

namespace App\Helper;

use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Models\FilesUpload;

class FileUploadHelper{
    public static function upload($image, $path_name){

 


            $current_year = Carbon::now()->format('Y');
            $uuid = (string) Str::uuid();
            $extension = $image->getClientOriginalExtension();
            $storage_filename = $uuid;
            $original_filename = $image->getClientOriginalName();
            $path = $image->storeAs("{$path_name}/{$current_year}", "{$storage_filename}.{$extension}", 'public');
            $file_uploaded =FilesUpload::create([
                "storage_filename" => $storage_filename,
                "original_name" => $original_filename,
                "extension" => $extension,
                "file_path" => $path
            ]);

            return $file_uploaded;
    }
}