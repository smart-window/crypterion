<?php
/**
 * ======================================================================================================
 * File Name: Validation.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 10/16/2019 (8:14 AM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace  App\Adapters\Coin\Resources;

use Exception;

trait Parser
{
	/**
	 * @param $name
	 * @return mixed|null
	 * @throws Exception
	 */
	public function get($name)
	{
		if (!property_exists($this, 'resource')) {
			throw new Exception("Resource property does not exists.");
		}

		if (!is_array($this->resource)) {
			throw new Exception("Resource is expected to be of typ array.");
		}

		return (isset($this->resource[$name])) ? $this->resource[$name] : null;
	}

	/**
	 * @param $resource
	 * @param array $optional
	 * @return array
	 * @throws Exception
	 */
	protected function parse($resource, array $optional = [])
	{
		if (!property_exists($this, 'validTypes')) return $resource;

		if (!is_array($resource)) {
			throw new Exception("The resource type must be an array.");
		}

		collect($this->validTypes)
			->each(function ($types, $name) use ($resource, $optional) {
				if (isset($resource[$name])) {
					$validTypes = explode('|', $types);
					$type = gettype($resource[$name]);

					if (!in_array($type, $validTypes)) {
						throw new Exception("Expected parameter {$types}: {$name}, but found {$type}.");
					}

				} else if (!in_array($name, $optional)) {
					throw new Exception("Missing attribute: {$name}");
				}
			});

		return $resource;
	}
}