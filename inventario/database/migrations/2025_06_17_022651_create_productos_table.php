<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->string('codigo_producto', 10)->primary();
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
            $table->string('categoria', 50);
            $table->decimal('precio', 10, 2);
            $table->integer('stock');
            $table->decimal('peso_kg', 6, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
