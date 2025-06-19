<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Storage;

class ProcessAvatarImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $imagePath;

    public function __construct(User $user, string $imagePath)
    {
        $this->user = $user;
        $this->imagePath = $imagePath;
    }

    public function handle()
    {
        // 画像を読み込み
        $image = Image::make(Storage::disk('s3')->get($this->imagePath));

        // リサイズ
        $image->resize(512, 512, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        // 画質調整
        $image->encode('png', 90);

        // 保存
        $processedPath = 'avatars/processed/' . basename($this->imagePath);
        Storage::disk('s3')->put($processedPath, $image->stream(), 'public');

        // ユーザー情報更新
        $this->user->update([
            'avatar_image' => Storage::disk('s3')->url($processedPath),
        ]);
    }
}
