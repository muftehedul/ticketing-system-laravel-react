<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@ticketing.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create sample customer user
        User::create([
            'name' => 'John Doe',
            'email' => 'customer@example.com',
            'password' => Hash::make('password123'),
            'role' => 'customer',
        ]);

        $this->command->info('Admin and sample user created successfully!');
        $this->command->info('Admin Email: admin@ticketing.com');
        $this->command->info('Admin Password: password123');
        $this->command->info('Customer Email: customer@example.com');
        $this->command->info('Customer Password: password123');
    }
}
