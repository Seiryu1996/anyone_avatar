<?php

namespace App\Http\Controllers\Api;

use App\Constants\ResponseCode;
use App\Http\Controllers\Controller;
use App\Http\Requests\AvatarRequest;
use App\Services\S3UploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;

/**
 * AvatarController
 *
 * Handles avatar-related operations such as capturing,
 * updating, and deleting avatars.
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
    const UPLOAD_OPTIONS = [
        'ContentType' => 'image/png',
        'CacheControl' => 'max-age=86400'
    ];

    /**
     * AvatarController constructor.
     *
     * @param S3UploadService $s3Service S3 upload service instance
     */
    public function __construct(S3UploadService $s3Service)
    {
        $this->s3Service = $s3Service;
    }

    /**
     * Capture and save the avatar image.
     *
     * @param Request $request request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function capture(AvatarRequest $request)
    {
        $validated = $request->validated();
        $user = auth()->user();
        $imageData = $validated['image'];
        // decode base64 image data
        $image = str_replace('data:image/png;base64,', '', $imageData);
        $image = str_replace(' ', '+', $image);
        $imageName = 'avatars/' . $user->id . '_' . time() . '.png';
        // save image to S3
        try {
            $result = $this->s3Service->uploadFile(
                $imageName,
                base64_decode($image),
                self::UPLOAD_OPTIONS
            );
            Log::info("S3に画像アップロード成功: path：{$result['path']} url：{$result['url']}");
        } catch (\Exception $e) {
            return response()->json(
                [
                    'message' => "画像の保存に失敗しました Error：{$e->getMessage()}",
                ],
                ResponseCode::INTERNAL_SERVER_ERROR
            );
        }
        // make thumbnail
        $manager = new ImageManager(new Driver());
        $img = $manager->read(base64_decode($image));
        $img->resize(200, 200);
        $thumbnailName = 'avatars/thumb_' . $user->id . '_' . time() . '.png';
        $encodedImage = $img->encode(new PngEncoder());
        try {
            $result = $this->s3Service->uploadFile(
                $thumbnailName,
                (string) $encodedImage,
                self::UPLOAD_OPTIONS
            );
            Log::info("サムネイル画像アップロード成功: path：{$result['path']} url：{$result['url']}");
        } catch (\Exception $e) {
            return response()->json(
                [
                    'message' => "画像のエンコードに失敗しました: {$e->getMessage()}",
                ],
                ResponseCode::INTERNAL_SERVER_ERROR
            );
        }
        // save avatar image URL to user model
        $user->update(
            [
                'avatar_image' => $result['url'],
            ]
        );

        return response()->json(
            [
                'message' => 'アバター画像が保存されました',
                'avatar_url' => $user->avatar_image,
            ]
        );
    }

    /**
     * Update avatar configuration settings.
     *
     * @param Request $request request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateConfig(AvatarRequest $request)
    {
        $validated = $request->validated();
        $config = $validated['config'];
        $user = auth()->user();
        $user->update(
            [
                'avatar_config' => $config,
            ]
        );
        return response()->json(
            [
                'message' => 'アバター設定が更新されました',
                'config' => $user->avatar_config,
            ]
        );
    }
}
