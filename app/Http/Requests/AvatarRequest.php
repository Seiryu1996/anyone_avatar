<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AvatarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $action = $this->route()->getActionMethod();
        return match($action) {
            'upload' => $this->_uploadRules(),
            'update' => $this->_updateRules(),
            'delete' => $this->_deleteRules(),
            default => []
        };
    }

    /**
     * Get the validation rules for updating an avatar.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    private function _uploadRules(): array
    {
        return [
            'avatar' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:10240', // 10MB
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'
            ],
            'user_id' => 'sometimes|integer|exists:users,id',
        ];
    }

    /**
     * Get the validation rules for deleting an avatar.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    private function _updateRules(): array
    {
        return [
            'avatar' => [
                'sometimes',
                'file',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:10240',
                'dimensions:min_width=100,min_height=100,max_width=2000,max_height=2000'
            ],
            'user_id' => 'required|integer|exists:users,id',
            'current_avatar_path' => 'sometimes|string',
        ];
    }

    /**
     * Get the validation rules for deleting an avatar.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    private function _deleteRules(): array
    {
        return [
            'user_id' => 'required|integer|exists:users,id',
            'avatar_path' => 'required|string',
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
            // Upload validation
            'avatar.required' => 'アバター画像を選択してください。',
            'avatar.file' => 'アップロードされたファイルが無効です。',
            'avatar.image' => '画像ファイルを選択してください。',
            'avatar.mimes' => 'JPEG、PNG、GIF、WebP形式の画像を選択してください。',
            'avatar.max' => 'ファイルサイズは10MB以下にしてください。',
            'avatar.dimensions' => '画像サイズは100x100ピクセル以上、2000x2000ピクセル以下にしてください。',
            // Common validation
            'user_id.required' => 'ユーザーIDが必要です。',
            'user_id.exists' => '指定されたユーザーが見つかりません。',
            'avatar_path.required' => 'アバターパスが必要です。',
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
        $validator->after(function ($validator) {
            $action = $this->route()->getActionMethod();
            match($action) {
                'upload' => $this->_validateUpload($validator),
                'update' => $this->_validateUpdate($validator),
                'delete' => $this->_validateDelete($validator),
                default => null
            };
        });
    }

    /**
     * Validate the upload request.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator instance
     *
     * @return void
     */
    private function _validateUpload($validator)
    {
        if ($this->hasFile('avatar')) {
            $file = $this->file('avatar');
            // check if the file is an image
            if ($file->getClientOriginalExtension() !== 'gif') {
                $image = getimagesize($file->getPathname());
                if ($image) {
                    $ratio = $image[0] / $image[1];
                    if ($ratio < 0.5 || $ratio > 2.0) {
                        $validator->errors()->add('avatar', '画像の縦横比は1:2から2:1の範囲内にしてください。');
                    }
                }
            }

            // check if the file name contains invalid characters
            $originalName = $file->getClientOriginalName();
            if (preg_match('/[^\w\-_\.]/', $originalName)) {
                $validator->errors()->add('avatar', 'ファイル名に使用できない文字が含まれています。');
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
    private function _validateUpdate($validator)
    {
        // check if the user_id matches the authenticated user
        if ($this->input('user_id') && auth()->id() !== (int)$this->input('user_id')) {
            // if the authenticated user is not an admin, add an error
            if (!auth()->user()->hasRole('admin')) {
                $validator->errors()->add('user_id', '他のユーザーのアバターは変更できません。');
            }
        }
    }

    /**
     * Validate the delete request.
     *
     * @param \Illuminate\Contracts\Validation\Validator $validator instance
     *
     * @return void
     */
    private function _validateDelete($validator)
    {
        // check if the user_id matches the authenticated user
        $userId = $this->input('user_id');
        if ($userId && auth()->id() !== (int)$userId) {
            if (!auth()->user()->hasRole('admin')) {
                $validator->errors()->add('user_id', '他のユーザーのアバターは削除できません。');
            }
        }
    }

    /**
     * Get the validated data from the request.
     *
     * @param string|null $key The key to retrieve from the validated data.
     * @param mixed $default The default value if the key does not exist.
     *
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        // if user_id is not specified, use the authenticated user's ID
        if (!isset($validated['user_id'])) {
            $validated['user_id'] = auth()->id();
        }
        return $validated;
    }

    /**
     * Get the user ID from the request.
     *
     * This method checks the request input for 'user_id', falls back to the route parameter 'userId',
     * and finally defaults to the authenticated user's ID if neither is provided.
     *
     * @return int The user ID.
     */
    public function getUserId(): int
    {
        return $this->input('user_id') ?? $this->route('userId') ?? auth()->id();
    }
}
