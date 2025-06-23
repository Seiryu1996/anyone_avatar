<?php

namespace App\Services;

use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;
use Illuminate\Support\Facades\Log;

class S3UploadService
{
    private $s3Client;
    private $bucket;

    public function __construct()
    {
        $this->s3Client = new S3Client([
            'version' => 'latest',
            'region' => config('filesystems.disks.s3.region'),
            'credentials' => [
                'key' => config('filesystems.disks.s3.key'),
                'secret' => config('filesystems.disks.s3.secret'),
            ],
        ]);
        $this->bucket = config('filesystems.disks.s3.bucket');
    }

    public function uploadFile($path, $content, $options = [])
    {
        $defaultOptions = [
            'Bucket' => $this->bucket,
            'Key' => $path,
            'Body' => $content,
        ];
        $uploadOptions = array_merge($defaultOptions, $options);
        try {
            $result = $this->s3Client->putObject($uploadOptions);
            $url = $this->s3Client->getObjectUrl($this->bucket, $path);
            return [
                'url' => $url,
                'path' => $path,
                'etag' => $result['ETag']
            ];
        } catch (S3Exception $e) {
            $logMessage = "S3へのアップロードに失敗しました: {$path}, エラー: {$e->getMessage()}";
            Log::error($logMessage);
            throw new \Exception($logMessage);
        }
    }
}
