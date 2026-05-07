<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <style>
        body {
            margin: 0;
            font-family: DejaVu Sans, sans-serif;
        }
        table {
            margin: 0 auto;
            width: 300px;
            border-collapse: collapse;
        }
        td {
            padding: 5px 0 5px 0;
        }
        .value {
            width: 72px;
            text-align: right;
            white-space: nowrap;
        }
        table {
            margin: 0 auto;
        }

    </style>

</head>


<body style="margin:0; ">
    <table>
        <tr>
            <td style="text-align: center;"> <img src="{{ $img }}" alt="Logo" style="width: 100px; "></td>
        </tr>

    </table>
    <table>
        <tr><td style="text-align: center; font-weight: bold; font-size: 20px">Ta'ramen</td></tr>
        <tr><td>Order: R4</td></tr>
        <tr><td>Employee: Diane</td></tr>
        <tr><td>POS: POS3</td></tr>
        <tr><td style="border-bottom: 1px dashed black"></td></tr>
        <tr><td>Dine in</td></tr>
        <tr><td style="border-bottom: 1px dashed black"></td></tr>
    </table>

    <table style="margin-top: 10px; margin-bottom: 10px">
        <tr>
            <td>Miso Ramen</td>
            <td class="value">&#8369; {{ number_format($price, 2) }}</td>
        </tr>
        <tr><td colspan="2">{{$quantity}} x &#8369;{{ number_format($subtotal, 2) }}</td></tr>
    </table>



    <table>
        <tr ><td colspan="2" style="border-bottom: 1px dashed black"></td></tr>
    </table>

    <table>
        <tr>
            <td style=" font-weight: bold; font-size: 24px; ">Total: </td>
            <td class="value" style=" font-weight: bold; font-size: 24px;">&#8369;{{ number_format($total, 2) }}</td>
        </tr>
        <tr>
            <td>Cash: </td>
            <td class="value"><span>&#8369; {{ number_format($totalCash, 2) }}</span></td>
        </tr>
        <tr>
            <td>Change: </td>
            <td class="value">&#8369;{{ number_format($change, 2) }}</td>
        </tr>

    </table>


    <table>
        <tr><td colspan="2" style="border-bottom: 1px dashed black"></td></tr>
        <tr>
            <td >{{$date}}</td>
            <td >{{$transactionId}}</td>
        </tr>
    </table>




</body>

</html>
