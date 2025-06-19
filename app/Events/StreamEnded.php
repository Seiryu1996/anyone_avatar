<?php

namespace App\Events;

use App\Models\Stream;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StreamEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $streamId;

    public function __construct(Stream $stream)
    {
        $this->streamId = $stream->id;
    }

    public function broadcastOn()
    {
        return new Channel('streams');
    }

    public function broadcastAs()
    {
        return 'stream.ended';
    }
}
