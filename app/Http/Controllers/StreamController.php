<?php

namespace App\Http\Controllers;

use App\Models\Stream;
use App\Events\StreamStarted;
use App\Events\StreamEnded;
use Illuminate\Http\Request;

class StreamController extends Controller
{
    public function index()
    {
        $streams = Stream::with('user')
            ->where('is_live', true)
            ->orderBy('viewers_count', 'desc')
            ->paginate(12);

        return response()->json($streams);
    }

    public function start(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:video,audio',
        ]);

        $user = auth()->user();

        // 既存のライブ配信を終了
        $user->streams()->where('is_live', true)->update([
            'is_live' => false,
            'ended_at' => now(),
        ]);

        // 新しい配信を開始
        $stream = $user->streams()->create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'type' => $request->input('type'),
        ]);

        $user->update(['is_streaming' => true]);

        broadcast(new StreamStarted($stream))->toOthers();

        return response()->json([
            'message' => '配信を開始しました',
            'stream' => $stream->load('user'),
        ]);
    }

    public function end($streamId)
    {
        $stream = Stream::findOrFail($streamId);
        $this->authorize('update', $stream);

        $stream->update([
            'is_live' => false,
            'ended_at' => now(),
        ]);

        $stream->user->update(['is_streaming' => false]);

        broadcast(new StreamEnded($stream))->toOthers();

        return response()->json([
            'message' => '配信を終了しました',
        ]);
    }

    public function join($streamId)
    {
        $stream = Stream::findOrFail($streamId);
        if (!$stream->is_live) {
            return response()->json(['error' => 'この配信は終了しています'], 404);
        }

        // 視聴者として追加
        $stream->viewers()->syncWithoutDetaching(auth()->id());
        $stream->increment('viewers_count');

        return response()->json([
            'stream' => $stream->load('user'),
            'stream_key' => $stream->stream_key,
        ]);
    }

    public function leave($streamId)
    {
        $stream = Stream::findOrFail($streamId);
        $stream->viewers()->detach(auth()->id());
        $stream->decrement('viewers_count');

        return response()->json([
            'message' => '配信から退出しました',
        ]);
    }
}
