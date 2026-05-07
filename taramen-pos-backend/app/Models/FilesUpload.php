<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FilesUpload extends Model
{
    use SoftDeletes;

    protected $fillable = [
        "storage_filename",
        "original_name",
        "extension",
        "file_path"
    ];
}
