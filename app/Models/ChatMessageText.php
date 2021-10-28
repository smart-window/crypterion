<?php

namespace App\Models;

use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ChatMessageText extends Model
{
    /**
     * The attributes that aren't mass assignable.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Set the body.
     *
     * @param string $value
     * @return void
     */
    public function setBodyAttribute($value)
    {
        $this->attributes['body'] = clean($value);
    }

    /**
     * Censor words in body
     *
     * @param $body
     * @return string|string[]
     */
    public function getBodyAttribute($body)
    {
        $disk = Storage::disk('local');

        try {
            $replace = explode(',', $disk->get('censor.txt'));
        } catch (Exception $e) {
            return $body;
        }

        foreach ($replace as $value) {
            $search = trim($value);

            if (!empty($search)) {
                $body = str_ireplace($search, '***', $body);
            }
        }
        return $body;
    }

    /**
     * Message model
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function message()
    {
        return $this->belongsTo(ChatMessage::class, 'message_id', 'id');
    }
}
