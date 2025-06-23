<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * AvatarRequest
 *
 * Handles validation for avatar-related requests such as
 * capturing and updating avatar configurations.
 *
 * @category Description
 * @package  App\Http\Requests
 * @author   Seiryu Uehata <seiryu.uehata@gmail.com>
 * @license  MIT https://opensource.org/license/mit/
 * @link     http://example.com
 */
class AvatarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string,
     * \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $action = $this->route()->getActionMethod();
        return match($action) {
            'capture' => $this->_captureRules(),
            'updateConfig' => $this->_updateConfigRules(),
            default => []
        };
    }

    /**
     * Get the validation rules for uploading an avatar.
     *
     * @return array<string,
     * \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    private function _captureRules(): array
    {
        return [
            'image' => [
                'required',
                'string',
            ],
        ];
    }

    /**
     * Get the validation rules for deleting an avatar.
     *
     * @return array<string,
     * \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    private function _updateConfigRules(): array
    {
        return [
            'config' => 'required|array',
        ];
    }

    /**
     * Get the custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Capture validation
            'image.required' => '画像データが必要です。',
            'image.string' => '画像データの形式が正しくありません。',
            // Update Config validation
            'config.required' => '設定データが必要です。',
            'config.array' => '設定データは配列形式である必要があります。',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator instance
     *
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(
            function ($validator) {
                $action = $this->route()->getActionMethod();
                match($action) {
                    'capture' => $this->_validateCapture($validator),
                    'updateConfig' => $this->_validateUpdateConfig($validator),
                    default => null
                };
            }
        );
    }

    /**
     * Validate the upload request.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator instance
     *
     * @return void
     */
    private function _validateCapture($validator)
    {
        $imageData = $this->input('image');
        if ($imageData) {
            // check if the image data is a valid base64 encoded string
            if (is_string($imageData)) {
                // confirm that the string is a valid base64 encoded image
                $base64Data = preg_replace('/^data:image\/[a-zA-Z]+;base64,/', '', $imageData);
                if (!base64_decode($base64Data, true)) {
                    $validator->errors()->add('image', '画像データの形式が正しくありません。');
                }
                // check if the image size exceeds 5MB
                $decodedData = base64_decode($base64Data);
                if (strlen($decodedData) > 5 * 1024 * 1024) { // 5MB
                    $validator->errors()->add('image', 'ファイルサイズは5MB以下にしてください。');
                }
            }
        }
    }

    /**
     * Validate the update request.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator instance
     *
     * @return void
     */
    private function _validateUpdateConfig($validator)
    {
        $config = $this->input('config');
        if (is_array($config)) {
            foreach ($config as $key => $value) {
                $allowedKeys = ['width', 'height', 'quality', 'format'];
                if (!in_array($key, $allowedKeys)) {
                    $validator->errors()->add("config.{$key}", "許可されていない設定項目です。");
                }
            }
        }
    }
}
