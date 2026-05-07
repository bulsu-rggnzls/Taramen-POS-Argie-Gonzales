<?php

namespace Database\Seeders;

use App\Models\Employee;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if( !env("APP_ENV")   ) {
            $employees = [
                [
                    "name" => "Mark Dhaniel C. Muga",
                    "employee_type_id" => 1,
                    "email" => "mark@taramen.com",
                    "contact_number" => "+63 912 345 6789",
                    "active" => true
                ]

            ];
        }else{
            $employees = [
                [
                    "name" => "Rigel",
                    "employee_type_id" => 1,
                    "email" => "rigel@taramen.com",
                    "contact_number" => "+63 912 345 6789",
                    "active" => true
                ],
                [
                    "name" => "Betelgeuse",
                    "employee_type_id" => 2,
                    "email" => "betelgeuse@taramen.com",
                    "contact_number" => "+63 912 345 6789",
                    "active" => true
                ],
                [
                    "name" => "Procyon",
                    "employee_type_id" => 3,
                    "email" => "procyon@taramen.com",
                    "contact_number" => "+63 912 345 6789",
                    "active" => true
                ]
            ];
        }

        foreach($employees as $employee){
            Employee::create($employee);
        }

    }
}
