<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\S3UploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;
use Illuminate\Support\Facades\Log;

/**
 * アバターコントローラー
 *
 * ユーザーのアバター画像のキャプチャ、保存、設定更新を行う
 *
 * @category Description
 * @package  App\Http\Controllers\Api
 * @author   Seiryu Uehata <seiryu.uehata@gmail.com>
 * @license  MIT https://opensource.org/license/mit/
 * @link     http://example.com
 */
class AvatarController extends Controller
{
    private $s3Service;

    /**
     * AvatarController constructor.
     *
     * @param S3UploadService $s3Service S3アップロードサービス
     */
    public function __construct(S3UploadService $s3Service)
    {
        $this->s3Service = $s3Service;
    }

    /**
     * アバター画像をキャプチャして保存する
     *
     * @param Request $request リクエスト
     *
     * @return \Illuminate\Http\JsonResponse
     */
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
            $result = $this->s3Service->uploadFile($imageName, base64_decode($image), [
                'ContentType' => 'image/jpeg',
                'CacheControl' => 'max-age=86400'
            ]);
            Log::info("S3に画像アップロード成功: path：{$result['path']} url：{$result['url']}");
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
            $result = $this->s3Service->uploadFile($thumbnailName, (string) $encodedImage, [
                'ContentType' => 'image/png',
                'CacheControl' => 'max-age=86400'
            ]);
            Log::info("サムネイル画像アップロード成功: path：{$result['path']} url：{$result['url']}");
        } catch (\Exception $e) {
            return response()->json([
                'message' => "画像のエンコードに失敗しました: {$e->getMessage()}",
            ], 500);
        }
        // ユーザー情報更新
        $user->update([
            'avatar_image' => $result['url'],
        ]);

        return response()->json([
            'message' => 'アバター画像が保存されました',
            'avatar_url' => $user->avatar_image,
        ]);
    }

    /**
     * アバター設定を更新する
     *
     * @param Request $request リクエスト
     *
     * @return \Illuminate\Http\JsonResponse
     */
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
