<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\{
//     AuthController,
//     AvatarController,
//     StreamController,
//     PostController,
//     UserController
// };
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AvatarController;
use App\Http\Controllers\Api\StreamController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\UserController;

// 認証
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    // 認証ユーザー情報
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // アバター
    Route::post('/avatar/capture', [AvatarController::class, 'capture']);
    Route::post('/avatar/config', [AvatarController::class, 'updateConfig']);

    // 配信
    Route::get('/streams', [StreamController::class, 'index']);
    Route::post('/streams/start', [StreamController::class, 'start']);
    Route::post('/streams/{stream}/end', [StreamController::class, 'end']);
    Route::post('/streams/{stream}/join', [StreamController::class, 'join']);
    Route::post('/streams/{stream}/leave', [StreamController::class, 'leave']);

    // 投稿
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/timeline', [PostController::class, 'timeline']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::post('/posts/{post}/like', [PostController::class, 'like']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    // ユーザー
    Route::get('/users/{user:username}', [UserController::class, 'profile']);
    Route::post('/users/{user}/follow', [UserController::class, 'follow']);
    Route::get('/users/{user}/followers', [UserController::class, 'followers']);
    Route::get('/users/{user}/following', [UserController::class, 'following']);
});
