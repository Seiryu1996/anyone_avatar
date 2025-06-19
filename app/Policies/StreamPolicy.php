<?php

namespace App\Policies;

use App\Models\Stream;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StreamPolicy
{
    use HandlesAuthorization;

    public function update(User $user, Stream $stream)
    {
        return $user->id === $stream->user_id;
    }
}
