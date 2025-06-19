// database/migrations/2024_01_01_000003_create_streams_table.php
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
        Schema::create('streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['video', 'audio']);
            $table->string('stream_key')->unique();
            $table->string('thumbnail')->nullable();
            $table->integer('viewers_count')->default(0);
            $table->boolean('is_live')->default(true);
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();
            $table->index(['is_live', 'created_at']);
        });
    }

    /**
     * Undocumented function
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('streams');
    }
};
