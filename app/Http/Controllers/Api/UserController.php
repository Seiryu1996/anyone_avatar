<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * Undocumented class
 *
 * @category Description
 * @package  Category
 * @author   Name <email@email.com>
 * @license  https://url.com MIT
 * @link     http://url.com
 */
class UserController extends Controller
{
    /**
     * Undocumented function
     *
     * @param string $username User Name
     *
     * @return void
     */
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

    public function updateProfile(Request $request)
    {
        $user = auth()->user();
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id . '|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'bio' => 'nullable|string|max:160',
        ]);

        $user->update([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'bio' => $request->bio,
        ]);

        return response()->json([
            'message' => 'プロフィールが更新されました',
            'user' => $user,
        ]);
    }
}
