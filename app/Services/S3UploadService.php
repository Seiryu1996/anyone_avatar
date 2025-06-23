<?php

namespace App\Services;

use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;
use Illuminate\Support\Facades\Log;

/**
 * S3UploadService
 *
 * Handles avatar-related operations such as uploading images to S3.
 *
 * @category Description
 * @package  App\Services
 * @author   Seiryu Uehata <seiryu.uehata@gmail.com>
 * @license  MIT https://opensource.org/license/mit/
 * @link     http://example.com
 */
class S3UploadService
{
    private $_s3Client;
    private $_bucket;

    /**
     * S3UploadService constructor.
     *
     * Initializes the S3 client with configuration from the environment.
     */
    public function __construct()
    {
        $this->_s3Client = new S3Client(
            [
                'version' => 'latest',
                'region' => config('filesystems.disks.s3.region'),
                'credentials' => [
                    'key' => config('filesystems.disks.s3.key'),
                    'secret' => config('filesystems.disks.s3.secret'),
                ],
            ]
        );
        $this->_bucket = config('filesystems.disks.s3._bucket');
    }

    /**
     * Uploads a file to S3.
     *
     * @param string $path    The path where the file will be stored in S3.
     * @param string $content The content of the file to upload.
     * @param array  $options Additional options for the upload.
     *
     * @return array Contains the URL, path, and ETag of the uploaded file.
     * @throws \Exception If the upload fails.
     */
    public function uploadFile($path, $content, $options = [])
    {
        $defaultOptions = [
            'Bucket' => $this->_bucket,
            'Key' => $path,
            'Body' => $content,
        ];
        $uploadOptions = array_merge($defaultOptions, $options);
        try {
            $result = $this->_s3Client->putObject($uploadOptions);
            $url = $this->_s3Client->getObjectUrl($this->_bucket, $path);
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
