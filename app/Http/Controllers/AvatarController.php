<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class AvatarController extends Controller
{
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
        Storage::disk('s3')->put($imageName, base64_decode($image), 'public');
        // サムネイル作成
        $img = Image::make(base64_decode($image));
        $img->resize(200, 200);
        $thumbnailName = 'avatars/thumb_' . $user->id . '_' . time() . '.png';
        Storage::disk('s3')->put($thumbnailName, $img->encode('png'), 'public');
        // ユーザー情報更新
        $user->update([
            'avatar_image' => Storage::disk('s3')->url($imageName),
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
