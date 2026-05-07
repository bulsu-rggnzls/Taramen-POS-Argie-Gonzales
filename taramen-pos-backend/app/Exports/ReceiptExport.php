<?php

namespace App\Exports;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ReceiptExport
{
    public function generate()
    {
        $items = 20;
        $baseWidth = 8 * 28.346;
        $baseHeight = 150;
        $rowheight = 25;


        $path = public_path('storage/images/TaramenLogo.png'); //since nasa public kaya public path

        $encodedImage = base64_encode(file_get_contents($path)); //
        $mime = mime_content_type($path);
        $img = "data:{$mime};base64,{$encodedImage}";

        $payload = [
            "img" => $img,
            "totalCash" => 2000,
            "date" => now()->format("m/d/Y H:i a"),
            "transactionId" => "123456789",
            "price" => 299, //array ito
            "subtotal" => 299, // array rin
            "quantity" => 1,
            "change" => 1401,
            "total" => 599,

        ];

        $calculatedHeight = $baseHeight + ($items * $rowheight);
        $html = view('receipt', $payload)->render();
        $receipt = Pdf::loadHTML($html)
         ->setPaper( [0,0, 300, $calculatedHeight], 'portrait')
         ->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true
         ]);

        return $receipt->stream('receipt.pdf');
    }
}
