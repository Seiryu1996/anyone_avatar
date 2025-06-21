<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * 投稿に対するコメント一覧を取得
     */
    public function index(Post $post)
    {
        $comments = $post->comments()
            ->whereNull('parent_id') // 親コメントのみ
            ->with(['user', 'replies.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($comments);
    }

    /**
     * コメントを投稿
     */
    public function store(Request $request, Post $post)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->input('content'),
            'parent_id' => $request->input('parent_id'),
        ]);

        // コメント数を更新
        $post->increment('comments_count');

        return response()->json([
            'message' => 'コメントを投稿しました',
            'comment' => $comment->load('user'),
        ], 201);
    }

    /**
     * コメントを削除
     */
    public function destroy(Comment $comment)
    {
        $this->authorize('delete', $comment);

        $post = $comment->post;
        $comment->delete();

        // コメント数を更新
        $post->decrement('comments_count');

        return response()->json([
            'message' => 'コメントを削除しました',
        ]);
    }
}
