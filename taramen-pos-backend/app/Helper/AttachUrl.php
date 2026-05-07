<?php

namespace  App\Helper;

use Illuminate\Support\Facades\URL;

class AttachUrl{

    public static function attachUrl($item, $expiresInMinutes = 15)
         
    {
        $storageFilename = $item->fileUpload?->storage_filename;

        if (!$storageFilename) {
            $item->setAttribute('image_url', null);
            return $item;
        }

        $signedUrl = URL::temporarySignedRoute(
            'secure.menu.image.signed',
            now()->addMinutes($expiresInMinutes),
            ['storage_filename' => $storageFilename]
        );

        $item->setAttribute('image_url', $signedUrl);

        return $item;

    }
}