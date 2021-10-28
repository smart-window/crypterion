<?php
/**
 * ======================================================================================================
 * File Name: Wallet.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 10/16/2019 (9:46 AM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Adapters\Coin\Resources;

class Wallet
{
	use Parser;

	protected $validTypes = [
		'id'      => 'string',
		'pending' => 'boolean',
		'data'    => 'array'
	];

	/**
	 * @var array
	 */
	protected $resource;

	/**
	 * Wallet constructor.
	 * @param $resource
	 * @throws \Exception
	 */
	public function __construct(array $resource)
	{
		$this->resource = $this->parse($resource, [
			'data', 'pending'
		]);
	}

	/**
	 * Get source id
	 *
	 * @return string
	 * @throws \Exception
	 */
	public function getId()
	{
		return $this->get('id');
	}

	/**
	 * Get wallet data
	 *
	 * @return array
	 * @throws \Exception
	 */
	public function getData()
	{
		return $this->get('data');
	}

	/**
	 * @return bool
	 * @throws \Exception
	 */
	public function isPending()
	{
		return $this->get('pending') ?: false;
	}
}