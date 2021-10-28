<?php

namespace App\Helpers;


use App\Models\Rating;
use Illuminate\Database\Eloquent\Model;

class RatingHelper
{
	protected $rating;

	public function __construct()
	{
		$this->rating = new Rating();
	}

	/**
	 * @param $rater
	 * @return RatingHelper
	 */
	public function by($rater)
	{
		$this->rating->rater()->associate($rater);

		return $this;
	}

	/**
	 * @param $subject
	 * @return $this
	 */
	public function on($subject)
	{
		$this->rating->subject()->associate($subject);

		return $this;
	}

	/**
	 * @param Model $rateable
	 * @param integer $rating
	 * @param null|string $comment
	 * @return Rating
	 */
	public function rate($rateable, $rating, $comment = null)
	{
		$this->rating->fill([
			'rating'  => $rating,
			'comment' => $comment
		]);

		$this->rating->rateable()->associate($rateable);

		$this->rating->save();
		return $this->rating;
	}
}