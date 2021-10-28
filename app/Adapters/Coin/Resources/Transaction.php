<?php
/**
 * ======================================================================================================
 * File Name: Transaction.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 10/16/2019 (8:04 AM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Adapters\Coin\Resources;

use App\Adapters\Coin\Exceptions\AdapterException;
use Carbon\Carbon;
use Exception;

class Transaction
{
	use Parser;

	protected $validTypes = [
		'id'            => 'string',
		'hash'          => 'string',
		'confirmations' => 'integer',
		'date'          => 'string',
		'value'         => 'integer|float|double',
		'type'          => 'string',
		'input'         => 'string|array',
		'output'        => 'string|array',
		'data'          => 'array'
	];

	/**
	 * @var array
	 */
	protected $resource;

	/**
	 * Transaction constructor.
	 * @param $resource
	 * @throws \Exception
	 */
	public function __construct(array $resource)
	{
		$this->resource = $this->parse($resource, ['data']);

		$this->validateAddress($this->getInput());
		$this->validateAddress($this->getOutput());
		$this->validateType();
	}

	/**
	 * @return string
	 * @throws Exception
	 */
	public function getId()
	{
		return $this->get('id');
	}

	/**
	 * @return string
	 * @throws Exception
	 */
	public function getHash()
	{
		return $this->get('hash');
	}

	/**
	 * @return Carbon
	 * @throws Exception
	 */
	public function getDate()
	{
		return Carbon::parse($this->get('date'));
	}

	/**
	 * @return int
	 * @throws Exception
	 */
	public function getConfirmations()
	{
		return $this->get('confirmations');
	}

	/**
	 * @return int
	 * @throws Exception
	 */
	public function getValue()
	{
		return $this->get('value');
	}

	/**
	 * @return array|string
	 * @throws Exception
	 */
	public function getInput()
	{
		return $this->get('input');
	}

	/**
	 * @return array|string
	 * @throws Exception
	 */
	public function getOutput()
	{
		return $this->get('output');
	}

	/**
	 * @return string
	 * @throws Exception
	 */
	public function getType()
	{
		return $this->get('type');
	}

	/**
	 * @return array
	 * @throws Exception
	 */
	public function getData()
	{
		return $this->get('data');
	}

	/**
	 * @param $type
	 * @return bool
	 * @throws Exception
	 */
	protected function validateType()
	{
		return in_array($this->get('type'), ["send", "receive"]);
	}

	/**
	 * Lock key for syncronization
	 *
	 * @return string
	 * @throws Exception
	 */
	public function lockKey()
	{
		return $this->getHash();
	}

	/**
	 * Validate inputs and outputs
	 *
	 * @param $address
	 */
	protected function validateAddress($address)
	{
		if (is_array($address)) {
			collect($address)->each(function ($object) {
				if (!is_array($object)) {
					throw new AdapterException("Address is expected to be an array of objects.");
				}

				if (!array_has($object, ['address', 'value'])) {
					throw new AdapterException("Objects should contain address, value pairs.");
				}
			});
		}
	}
}