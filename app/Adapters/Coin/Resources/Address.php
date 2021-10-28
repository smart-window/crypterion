<?php
/**
 * ======================================================================================================
 * File Name: Address.php
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


class Address
{
	use Parser;

	protected $validTypes = [
		'id'      => 'string',
		'label'   => 'string',
		'address' => 'string',
		'pending' => 'boolean',
		'data'    => 'array'
	];

	/**
	 * @var array
	 */
	protected $resource;

	/**
	 * Address constructor.
	 *
	 * @param $resource
	 * @throws \Exception
	 */
	public function __construct(array $resource)
	{
		$this->resource = $this->parse($resource, [
			'data', 'label', 'pending'
		]);
	}

	/**
	 * @return string
	 * @throws \Exception
	 */
	public function getId()
	{
		return $this->get('id');
	}

	/**
	 * @return string
	 * @throws \Exception
	 */
	public function getLabel()
	{
		return $this->get('label');
	}

	/**
	 * @return string
	 * @throws \Exception
	 */
	public function getAddress()
	{
		return $this->get('address');
	}

	/**
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