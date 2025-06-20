<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'likes'])
            ->withCount(['likes', 'comments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($posts);
    }

    public function timeline()
    {
        $user = auth()->user();
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $posts = Post::with(['user', 'likes'])
            ->withCount(['likes', 'comments'])
            ->whereIn('user_id', $followingIds)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:280',
            'media' => 'nullable|array',
            'media.*' => 'file|mimes:jpg,jpeg,png,gif,mp4|max:10240',
        ]);

        $mediaUrls = [];
        if ($request->hasFile('media')) {
            foreach ($request->file('media') as $file) {
                $path = $file->store('posts/' . auth()->id(), 's3');
                $mediaUrls[] = Storage::disk('s3')->url($path);
            }
        }

        $post = auth()->user()->posts()->create([
            'content' => $request->input('content'),
            'media' => $mediaUrls,
        ]);

        return response()->json([
            'message' => '投稿が作成されました',
            'post' => $post->load('user'),
        ], 201);
    }

    public function like(Post $post)
    {
        $user = auth()->user();
        if ($post->isLikedBy($user)) {
            $post->likes()->detach($user->id);
            $post->decrement('likes_count');
            $liked = false;
        } else {
            $post->likes()->attach($user->id);
            $post->increment('likes_count');
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->likes_count,
        ]);
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);
        $post->delete();

        return response()->json([
            'message' => '投稿が削除されました',
        ]);
    }
}
