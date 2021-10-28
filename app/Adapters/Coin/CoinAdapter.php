<?php
/**
 * ======================================================================================================
 * File Name: WalletInterface.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 7/10/2019 (11:02 AM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2019. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Adapters\Coin;


use App\Adapters\Coin\Resources\Address;
use App\Adapters\Coin\Resources\Transaction;
use App\Adapters\Coin\Resources\Wallet;
use Illuminate\Support\Facades\URL;

abstract class CoinAdapter
{
	/**
	 * Get coin name
	 *
	 * @return string
	 */
	abstract public function getName(): string;

	/**
	 * Get coin identifier
	 *
	 * @return string
	 */
	abstract public function getIdentifier(): string;

	/**
	 * Get coin unit
	 *
	 * @return int|float
	 */
	abstract public function getBaseUnit();

	/**
	 * Get coin precision
	 *
	 * @return int|float
	 */
	abstract public function getPrecision();

	/**
	 * Get coin symbol
	 *
	 * @return mixed
	 */
	abstract public function getSymbol(): string;

	/**
	 * Show symbol first
	 *
	 * @return bool
	 */
	abstract public function showSymbolFirst(): bool;

	/**
	 * Get color used for highlighting
	 *
	 * @return string
	 */
	abstract public function getColor(): string;

	/**
	 * Generate wallet
	 *
	 * @param string $label
	 * @param string $passphrase
	 * @return Wallet
	 */
	abstract public function createWallet($label, $passphrase): Wallet;

	/**
	 * Create address for users
	 *
	 * @param Wallet $wallet
	 * @param $label
	 * @return Address
	 */
	abstract public function createWalletAddress(Wallet $wallet, $label = 'Default'): Address;

	/**
	 * Send transaction
	 *
	 * @param Wallet $wallet
	 * @param string $address
	 * @param int $amount
	 * @param $passphrase
	 * @return Transaction
	 */
	abstract public function send(Wallet $wallet, $address, $amount, $passphrase);


	/**
	 * Get wallet transaction by id
	 *
	 * @param Wallet $wallet
	 * @param $id
	 * @return Transaction
	 */
	abstract public function getWalletTransaction(Wallet $wallet, $id): Transaction;

	/**
	 * Handle coin webhook and return the transaction data
	 *
	 * @param Wallet $wallet
	 * @param $payload
	 * @return Transaction|null
	 */
	abstract public function handleTransactionWebhook(Wallet $wallet, $payload): ?Transaction;

	/**
	 * Add webhook for wallet.
	 *
	 * @param Wallet $wallet
	 * @param $minConfirmations
	 * @return mixed
	 */
	abstract public function setTransactionWebhook(Wallet $wallet, int $minConfirmations = 3);

	/**
	 * Get the dollar price
	 *
	 * @return float
	 */
	abstract public function getDollarPrice(): float;

	/**
	 * Calculate the transaction fee
	 *
	 * @param integer $inputs
	 * @param integer $outputs
	 * @param int $amount
	 * @return float
	 */
	abstract public function calcTransactionFee(int $inputs, int $outputs, $amount = 0);

	/**
	 * Get minimum transferable amount.
	 *
	 * @return int
	 */
	abstract public function getMinimumTransferable();

	/**
	 * Get maximum transferable amount.
	 *
	 * @return int|null
	 */
	abstract public function getMaximumTransferable();

	/**
	 * Get webhook url
	 *
	 * @return string
	 */
	final public function transactionWebhookUrl()
	{
		$this->bindLocalUrl();

		$url = route('coin.webhook.transaction', [
			'identifier' => $this->getIdentifier()
		]);

		$this->unbindLocalUrl();
		return $url;
	}

	/**
	 * Get webhook url
	 *
	 * @return string
	 */
	final public function pendingApprovalWebhookUrl()
	{
		$this->bindLocalUrl();

		$url = route('coin.webhook.pending-approval', [
			'identifier' => $this->getIdentifier()
		]);

		$this->unbindLocalUrl();
		return $url;
	}

	/**
	 * Set url to allow local environment to
	 * receive callback for development testing
	 */
	final private function bindLocalUrl()
	{
		$root = config('app.url');

		if (app()->environment() === "local") {
			URL::forceRootUrl($root);
		}
	}

	/**
	 * Unset url to allow local environment to
	 * receive callback for development testing
	 */
	final private function unbindLocalUrl()
	{
		if (!app()->runningInConsole()) {
			$baseUrl = request()->getBaseUrl();
		}

		$root = $baseUrl ?? config('app.url');

		if (app()->environment() === "local") {
			URL::forceRootUrl($root);
		}
	}
}
