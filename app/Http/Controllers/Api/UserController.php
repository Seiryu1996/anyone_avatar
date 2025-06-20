<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function profile($username)
    {
        $user = User::where('username', $username)
            ->withCount(['posts', 'followers', 'following'])
            ->firstOrFail();

        $user->is_following = auth()->check() ? auth()->user()->isFollowing($user) : false;

        return response()->json($user);
    }

    public function follow(User $user)
    {
        $follower = auth()->user();
        if ($follower->id === $user->id) {
            return response()->json(['error' => '自分自身をフォローすることはできません'], 400);
        }

        if ($follower->isFollowing($user)) {
            $follower->following()->detach($user->id);
            $following = false;
        } else {
            $follower->following()->attach($user->id);
            $following = true;
        }

        return response()->json([
            'following' => $following,
            'followers_count' => $user->followers()->count(),
        ]);
    }

    public function followers(User $user)
    {
        $followers = $user->followers()
            ->withCount(['followers', 'following'])
            ->paginate(20);

        return response()->json($followers);
    }

    public function following(User $user)
    {
        $following = $user->following()
            ->withCount(['followers', 'following'])
            ->paginate(20);

        return response()->json($following);
    }
}
