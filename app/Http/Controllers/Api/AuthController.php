<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'required|email|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        try {
            Log::info('Start Function Login');
            Log::info('Start Validate');
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);
            Log::info('End Validate');
            Log::info('Start Fetch');
            $user = User::where('email', $request->email)->first();
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'メールアドレスまたはパスワードが正しくありません',
                ], 401);
            }
            Log::info('End Fetch');
            $token = $user->createToken('auth-token')->plainTextToken;
            Log::info('End Function Login');
            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 200);
        } catch (\Exception $e) {
            Log::error("Exception message：{$e->getMessage()}");
            return response()->json([
                'message' => 'システムエラーが発生しました',
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'ログアウトしました',
        ]);
    }
}
