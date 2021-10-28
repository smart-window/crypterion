<?php

namespace App\Adapters\Coin;


use HolluwaTosin360\BitGoPHP\Coin;

class BitcoinCashAdapter extends BitGoAdapter
{
	const NAME = 'Bitcoin Cash';
	const IDENTIFIER = "bch";
	const BASE_UNIT = 100000000;
	const PRECISION = 8;
	const SYMBOL = "BCH";
	const SYMBOL_FIRST = true;
	const COLOR = '#8dc351';

    /**
     * Get Bitgo Identifier
     *
     * @return string
     */
    public function getBitgoIdentifier(): string
    {
        return Coin::BITCOIN_CASH;
    }

    /**
     * Get Bitgo Identifier
     *
     * @return string
     */
    public function getBitgoTestIdentifier(): string
    {
        return Coin::TEST_BITCOIN_CASH;
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
		$feePerByte = $this->getFeePerByteEstimate();
		$bitgoFee = config('bitgo.fee_percent') * $amount;
		$multiplier = (($inputs * 180) + (($outputs + 1) * 50) + 50 + $inputs);
		return ($feePerByte * $multiplier) + $bitgoFee;
	}

	/**
	 * Get minimum transferable amount in base unit.
	 *
	 * @return int
	 */
	public function getMinimumTransferable()
	{
		return 3000;
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
