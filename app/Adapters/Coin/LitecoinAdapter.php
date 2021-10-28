<?php

namespace App\Adapters\Coin;


use HolluwaTosin360\BitGoPHP\Coin;

class LitecoinAdapter extends BitGoAdapter
{
	const NAME = 'Litecoin';
	const IDENTIFIER = "ltc";
	const BASE_UNIT = 100000000;
	const PRECISION = 8;
	const SYMBOL = "LTC";
	const SYMBOL_FIRST = true;
	const COLOR = '#b8b8b8';

    /**
     * Get Bitgo Identifier
     *
     * @return string
     */
    public function getBitgoIdentifier(): string
    {
        return Coin::LITECOIN;
    }

    /**
     * Get Bitgo Identifier
     *
     * @return string
     */
    public function getBitgoTestIdentifier(): string
    {
        return Coin::TEST_LITECOIN;
    }

	/**
	 * Calculate the next transaction fee
	 *
	 * @param int $inputs The total number of unspent receive address.
	 * A receive address is unspent if there has not been any sent transaction since
	 * the last received transaction. Defaults to 1
	 *
	 * @param int $outputs The total number of output address. Defaults to 1
	 * @param int $amount The amount in base unit.
	 * @return float
	 * @throws \GuzzleHttp\Exception\GuzzleException
	 */
	public function calcTransactionFee(int $inputs, int $outputs, $amount = 0): float
	{
		// Estimate Fee per KB
		$feePerByte = $this->getFeePerByteEstimate();
		$multiplier = (($inputs * 180) + (($outputs + 1) * 50) + 50 + $inputs);
		$estimate = ($feePerByte * $multiplier);

		// Base Fee
		$baseFee = 0.002 * $this->getBaseUnit();

		$fee = $estimate > $baseFee ? $estimate : $baseFee;
		$bitgoFee = config('bitgo.fee_percent') * $amount;
		return $fee + $bitgoFee;
	}

	/**
	 * Get minimum transferable amount in base unit.
	 *
	 * @return int
	 */
	public function getMinimumTransferable()
	{
		return 0.002 * $this->getBaseUnit();
	}

	/**
	 * Get maximum transferable amount in base unit.
	 *
	 * @return int
	 */
	public function getMaximumTransferable()
	{
		return 1000 * $this->getBaseUnit();
	}
}
