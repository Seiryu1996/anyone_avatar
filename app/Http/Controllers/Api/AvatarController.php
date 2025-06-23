<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;
use Illuminate\Support\Facades\Log;

class AvatarController extends Controller
{
    public function s3Put($name, $content, $visibility = 'public')
    {
        $isUpload = false;
        try {
            $isUpload = Storage::disk('s3')->put($name, $content, $visibility);
        } catch (\Exception $e) {
            $logMessage = "S3へのアップロードに失敗しました: {$name}, エラー: {$e->getMessage()}";
            Log::error($logMessage);
            throw new \Exception($logMessage);
        }
        if (!$isUpload) {
            dd($isUpload);
            $logMessage = "S3へのアップロードに失敗しました: {$name}";
            Log::error($logMessage);
            throw new \Exception($logMessage);
        }
        Log::info("S3に画像アップロード成功: {$name}");
    }

    public function capture(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
        ]);

        $user = auth()->user();
        $imageData = $request->input('image');
        // Base64デコード
        $image = str_replace('data:image/png;base64,', '', $imageData);
        $image = str_replace(' ', '+', $image);
        $imageName = 'avatars/' . $user->id . '_' . time() . '.png';
        // S3に保存
        try {
            $this->s3Put($imageName, base64_decode($image));
        } catch (\Exception $e) {
            return response()->json([
                'message' => "画像の保存に失敗しました Error：{$e->getMessage()}",
            ], 500);
        }
        // サムネイル作成
        $manager = new ImageManager(new Driver());
        $img = $manager->read(base64_decode($image));
        $img->resize(200, 200);
        $thumbnailName = 'avatars/thumb_' . $user->id . '_' . time() . '.png';
        $encodedImage = $img->encode(new PngEncoder());
        try {
            $this->s3Put($thumbnailName, (string) $encodedImage);
        } catch (\Exception $e) {
            return response()->json([
                'message' => "画像のエンコードに失敗しました: {$e->getMessage()}",
            ], 500);
        }
        $url = Storage::disk('s3')->url($imageName);
        Log::info("S3に画像アップロード成功: {$thumbnailName}");
        Log::info("アップロード後の画像URL: {$url}");
        // ユーザー情報更新
        $user->update([
            'avatar_image' => $url,
        ]);

        return response()->json([
            'message' => 'アバター画像が保存されました',
            'avatar_url' => $user->avatar_image,
        ]);
    }

    public function updateConfig(Request $request)
    {
        $request->validate([
            'config' => 'required|array',
        ]);

        $user = auth()->user();
        $user->update([
            'avatar_config' => $request->input('config'),
        ]);

        return response()->json([
            'message' => 'アバター設定が更新されました',
            'config' => $user->avatar_config,
        ]);
    }
}
