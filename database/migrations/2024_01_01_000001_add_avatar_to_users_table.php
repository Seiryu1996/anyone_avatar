// database/migrations/2024_01_01_000001_add_avatar_to_users_table.php
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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('name');
            $table->string('avatar_image')->nullable();
            $table->json('avatar_config')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_streaming')->default(false);
        });
    }

    /**
     * Undocumented function
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'avatar_image', 'avatar_config', 'bio', 'is_streaming']);
        });
    }
};
