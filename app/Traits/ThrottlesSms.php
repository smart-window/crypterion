<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Str;

trait ThrottlesSms
{
    /**
     * Determine if the user has too many failed login attempts.
     *
     * @param User $user
     * @return bool
     */
    protected function hasTooManySmsAttempts($user)
    {
        return $this->smsLimiter()->tooManyAttempts(
            $this->throttleSmsKey($user), $this->maxSmsAttempts()
        );
    }

    /**
     * Increment the login attempts for the user.
     *
     * @param  User $user
     * @return void
     */
    protected function incrementSmsAttempts($user)
    {
        $this->smsLimiter()->hit(
            $this->throttleSmsKey($user), $this->decaySmsSeconds()
        );
    }

    /**
     * Clear the login locks for the given user credentials.
     *
     * @param User $user
     * @return void
     */
    protected function clearSmsAttempts($user)
    {
        $this->smsLimiter()->clear($this->throttleSmsKey($user));
    }

    /**
     * Show the number of minutes left to retry
     *
     * @return int
     */
    public function retrySmsAttemptInMinutes($user)
    {
        $seconds = $this->smsLimiter()->availableIn(
            $this->throttleSmsKey($user)
        );

        return round($seconds / 60) ?: 0;
    }

    /**
     * Get the throttle key for the given request.
     *
     * @param User $user
     * @return string
     */
    private function throttleSmsKey($user)
    {
        return Str::lower($user->name) . '|' . 'sms';
    }

    /**
     * Get the rate smsLimiter instance.
     *
     * @return \Illuminate\Cache\RateLimiter
     */
    private function smsLimiter()
    {
        return app(RateLimiter::class);
    }

    /**
     * Get the maximum number of attempts to allow.
     *
     * @return int
     */
    private function maxSmsAttempts()
    {
        return property_exists($this, 'maxSmsAttempts') ? $this->maxSmsAttempts : 3;
    }

    /**
     * Get the number of minutes to throttle for.
     *
     * @return int
     */
    private function decaySmsSeconds()
    {
        return property_exists($this, 'decaySmsSeconds') ? $this->decaySmsSeconds : 60 * 60;
    }
}
