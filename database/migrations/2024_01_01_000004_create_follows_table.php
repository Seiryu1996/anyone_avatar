// database/migrations/2024_01_01_000004_create_follows_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration

{
    /**
     * Undocumented function
     *
     * @return void
     */
    public function up()
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('following_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['follower_id', 'following_id']);
            $table->index('following_id');
        });
    }

    /**
     * Undocumented function
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('follows');
    }
};
