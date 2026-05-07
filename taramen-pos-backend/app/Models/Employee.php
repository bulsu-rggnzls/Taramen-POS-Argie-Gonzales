<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'name',
        'employee_type_id',
        'email',
        'contact_number',
        'profile',
        'active',
    ];
    
    protected $casts = [
        'active' => 'boolean'
    ];

    public function employeeType(): BelongsTo
    {
        return $this->belongsTo(EmployeeType::class);
    }
}
