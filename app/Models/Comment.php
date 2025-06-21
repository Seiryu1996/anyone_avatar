<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'post_id',
        'content',
        'parent_id', // 返信機能用（オプション）
    ];

    protected $with = ['user']; // 常にユーザー情報を含める

    protected $appends = ['replies_count']; // 返信数を追加

    /**
     * コメントを投稿したユーザー
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * コメントが属する投稿
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * 親コメント（返信機能用）
     */
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * 返信コメント
     */
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }

    /**
     * 返信数を取得
     */
    public function getRepliesCountAttribute()
    {
        return $this->replies()->count();
    }
}
