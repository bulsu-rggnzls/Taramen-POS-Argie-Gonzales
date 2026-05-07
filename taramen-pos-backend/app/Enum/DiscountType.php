<?php

namespace App\Enum;

enum DiscountType :string
{
    case PERCENTAGE = "percentage";
    case FIXED = "fixed";
    case BUY1TAKE1 = "buy1take1";
}
