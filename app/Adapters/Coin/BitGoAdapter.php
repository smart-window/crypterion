<?php
/**
 * ======================================================================================================
 * File Name: BitGoAdapter.php
 * ======================================================================================================
 * Author: HolluwaTosin360
 * ------------------------------------------------------------------------------------------------------
 * Portfolio: http://codecanyon.net/user/holluwatosin360
 * ------------------------------------------------------------------------------------------------------
 * Date & Time: 2/27/2021 (5:11 PM)
 * ------------------------------------------------------------------------------------------------------
 *
 * Copyright (c) 2021. This project is released under the standard of CodeCanyon License.
 * You may NOT modify/redistribute this copy of the project. We reserve the right to take legal actions
 * if any part of the license is violated. Learn more: https://codecanyon.net/licenses/standard.
 *
 * ------------------------------------------------------------------------------------------------------
 */

namespace App\Adapters\Coin;


use App\Adapters\Coin\Exceptions\AdapterException;
use App\Adapters\Coin\Resources\Address;
use App\Adapters\Coin\Resources\PendingApproval;
use App\Adapters\Coin\Resources\Transaction;
use App\Adapters\Coin\Resources\Wallet;
use GuzzleHttp\Client;
use HolluwaTosin360\BitGoPHP\BitGo;

abstract class BitGoAdapter extends CoinAdapter
{
    /**
     * Bitgo Instance
     *
     * @var BitGo
     */
    protected $bitgo;

    /**
     * Dollar Price
     *
     * @var float
     */
    protected $dollarPrice;

    /**
     * BitGoAdapter constructor.
     *
     * @throws \Exception
     */
    public function __construct()
    {
        $this->init();
    }

    /**
     * Initialize BitGo Helper class
     *
     * @throws \Exception
     */
    private function init()
    {
        $bitgo = resolve(BitGo::class);

        if (config('bitgo.env') != "prod") {
            $bitgo->setCoin($this->getBitgoTestIdentifier());
        } else {
            $bitgo->setCoin($this->getBitgoIdentifier());
        }

        $this->bitgo = $bitgo;
    }

    /**
     * Get bitgo identifier
     *
     * @return string
     */
    abstract protected function getBitgoIdentifier(): string;

    /**
     * Get bitgo test identifier
     *
     * @return string
     */
    abstract protected function getBitgoTestIdentifier(): string;

    /**
     * Exclude bitgo property
     *
     * @return array
     */
    public function __sleep()
    {
        return [];
    }

    /**
     * @throws \Exception
     */
    public function __wakeup()
    {
        $this->init();
    }

    /**
     * Get coin name
     *
     * @return string
     */
    public function getName(): string
    {
        return static::NAME;
    }

    /**
     * Get coin identifier
     *
     * @return string
     */
    public function getIdentifier(): string
    {
        return static::IDENTIFIER;
    }

    /**
     * Get coin unit
     *
     * @return string
     */
    public function getBaseUnit()
    {
        return static::BASE_UNIT;
    }

    /**
     * Get coin precision
     *
     * @return int
     */
    public function getPrecision()
    {
        return static::PRECISION;
    }

    /**
     * Get coin symbol
     *
     * @return mixed
     */
    public function getSymbol(): string
    {
        return static::SYMBOL;
    }

    /**
     * Show symbol first
     *
     * @return bool
     */
    public function showSymbolFirst(): bool
    {
        return static::SYMBOL_FIRST;
    }

    /**
     * @return string
     */
    public function getColor(): string
    {
        return static::COLOR;
    }

    /**
     * Generate wallet
     *
     * @param string $label
     * @param string $passphrase
     * @return Wallet
     * @throws AdapterException
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function createWallet($label, $passphrase): Wallet
    {
        $response = $this->bitgo->generateWallet($label, $passphrase);
        $data = collect($response);

        return new Wallet([
            'id'   => $data->get('id'),
            'data' => $data->toArray()
        ]);
    }

    /**
     * Create address for users
     *
     * @param Wallet $wallet
     * @param $label
     * @return Address
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws AdapterException
     * @throws \Exception
     */
    public function createWalletAddress(Wallet $wallet, $label = 'Default'): Address
    {
        $this->bitgo->setWalletId($wallet->getId());

        $response = $this->bitgo->createWalletAddress(false, 0, null, $label);
        $data = collect($response);

        return new Address([
            'id'      => $data->get('id'),
            'label'   => $label,
            'address' => $data->get('address'),
            'data'    => $data->toArray(),
        ]);
    }

    /**
     * Send transaction
     *
     * @param Wallet $wallet
     * @param string $address
     * @param int $amount
     * @param $passphrase
     * @return Transaction|PendingApproval
     * @throws AdapterException
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function send(Wallet $wallet, $address, $amount, $passphrase)
    {
        $this->bitgo->setWalletId($wallet->getId());
        $response = $this->bitgo->sendTransaction($address, $amount, $passphrase);

        if (isset($response['transfer'])) {
            $data = collect($response['transfer']);

            return new Transaction([
                'id'            => $data->get('id'),
                'value'         => (float) $data->get('value', $data->get('valueString')),
                'hash'          => $data->get('txid'),
                'input'         => $this->parseAddress($data->get('inputs', [])),
                'output'        => $this->parseAddress($data->get('outputs', [])),
                'confirmations' => (int) $data->get('confirmations'),
                'type'          => $data->get('type'),
                'date'          => $data->get('date'),
            ]);
        } else if (isset($response['pendingApproval'])) {
            $data = collect($response['pendingApproval']);

            return new PendingApproval([
                'id'    => $data->get('id'),
                'state' => $data->get('state'),
                'scope' => $data->get('scope'),
                'info'  => $data->get('info'),
                'data'  => $data->toArray(),
            ]);
        } else {
            throw new AdapterException('Invalid transaction data!');
        }
    }

    /**
     * Get pending approval
     *
     * @param Wallet $wallet
     * @param $id
     * @return PendingApproval
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function getPendingApproval(Wallet $wallet, $id): PendingApproval
    {
        $this->bitgo->setWalletId($wallet->getId());
        $response = $this->bitgo->getPendingApproval($id);
        $data = collect($response);

        return new PendingApproval([
            'id'    => $data->get('id'),
            'state' => $data->get('state'),
            'scope' => $data->get('scope'),
            'info'  => $data->get('info'),
            'data'  => $data->toArray(),
        ]);
    }

    /**
     * Set pending approval webhook url for wallet.
     *
     * @param Wallet $wallet
     * @param int $minConfirmations
     * @return void
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function setPendingApprovalWebhook(Wallet $wallet)
    {
        $url = $this->pendingApprovalWebhookUrl();
        $this->bitgo->setWalletId($wallet->getId());
        $this->bitgo->addWalletWebhook($url, "pendingapproval");
    }

    /**
     * Unset webhook for pending approval.
     *
     * @param Wallet $wallet
     * @return void
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function unsetPendingApprovalWebhook(Wallet $wallet)
    {
        $this->bitgo->setWalletId($wallet->getId());
        $url = $this->pendingApprovalWebhookUrl();
        $this->bitgo->removeWalletWebhook($url, "pendingapproval");
    }

    /**
     * Handle coin webhook and return the pending approval data
     *
     * @param Wallet $wallet
     * @param $payload
     * @return PendingApproval|null
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function handlePendingApprovalWebhook(Wallet $wallet, $payload): ?PendingApproval
    {
        $body = collect($payload);

        if ($body->get('type') !== "pendingapproval") return null;
        if ($body->get('walletId') !== $wallet->getId()) return null;
        if (!$body->get('pendingApprovalId')) return null;

        return $this->getPendingApproval($wallet, $body->get('pendingApprovalId'));
    }

    /**
     * Get wallet transaction by id
     *
     * @param Wallet $wallet
     * @param $id
     * @return Transaction
     * @throws AdapterException
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function getWalletTransaction(Wallet $wallet, $id): Transaction
    {
        $this->bitgo->setWalletId($wallet->getId());
        $response = $this->bitgo->getWalletTransfer($id);
        $data = collect($response);

        return new Transaction([
            'id'            => $data->get('id'),
            'value'         => (float) $data->get('value', $data->get('valueString')),
            'hash'          => $data->get('txid'),
            'input'         => $this->parseAddress($data->get('inputs', [])),
            'output'        => $this->parseAddress($data->get('outputs', [])),
            'confirmations' => (int) $data->get('confirmations'),
            'type'          => $data->get('type'),
            'date'          => $data->get('date'),
        ]);
    }

    /**
     * Handle coin webhook and return the transaction data
     *
     * @param Wallet $wallet
     * @param $payload
     * @return Transaction|null
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function handleTransactionWebhook(Wallet $wallet, $payload): ?Transaction
    {
        $body = collect($payload);

        if ($body->get('type') !== "transfer") return null;
        if ($body->get('wallet') !== $wallet->getId()) return null;
        if (!$body->get('hash')) return null;

        return $this->getWalletTransaction($wallet, $body->get('hash'));
    }

    /**
     * Parse addresses
     *
     * @param $address
     * @return array|string
     * @throws AdapterException
     */
    protected function parseAddress($address)
    {
        if (!is_array($address)) {
            throw new AdapterException("Invalid address format.");
        } else {
            return collect($address)->map(function ($object) {
                if (!is_array($object)) {
                    throw new AdapterException("Address is expected to be an array of objects.");
                }
                if (!isset($object['value']) && isset($object['valueString'])) {
                    $object['value'] = (float) $object['valueString'];
                }
                if (!array_has($object, ['address', 'value'])) {
                    throw new AdapterException("Objects should contain address, value pairs.");
                }
                return array_only($object, ['address', 'value']);
            })->toArray();
        }
    }

    /**
     * Get the dollar price
     *
     * @return float
     */
    public function getDollarPrice(): float
    {
        if (!isset($this->dollarPrice)) {
            $client = new Client([
                'base_uri' => 'https://min-api.cryptocompare.com/'
            ]);

            $response = $client->get("data/price", [
                'query' => array_filter([
                    'fsym'    => strtoupper($this->getIdentifier()),
                    'tsyms'   => 'USD',
                    'api_key' => config('cryptocompare.key'),
                ])
            ]);

            $price = json_decode($response->getBody(), true)['USD'];
            $this->dollarPrice = (float) $price;
        }
        return $this->dollarPrice;
    }

    /**
     * Set transaction webhook url for wallet.
     *
     * @param Wallet $wallet
     * @param int $minConfirmations
     * @return void
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function setTransactionWebhook(Wallet $wallet, int $minConfirmations = 3)
    {
        $url = $this->transactionWebhookUrl();
        $this->bitgo->setWalletId($wallet->getId());
        if ($minConfirmations > 1) {
            $this->bitgo->addWalletWebhook($url, "transfer", 0);
            $this->bitgo->addWalletWebhook($url, "transfer", 1);
            $this->bitgo->addWalletWebhook($url, "transfer", $minConfirmations);
            $this->bitgo->addWalletWebhook($url, "transfer", $minConfirmations + 1);
        } else {
            $this->bitgo->addWalletWebhook($url, "transfer", 0);
            $this->bitgo->addWalletWebhook($url, "transfer", 1);
        }
    }

    /**
     * Unset webhook for wallet.
     *
     * @param Wallet $wallet
     * @return void
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Exception
     */
    public function unsetTransactionWebhook(Wallet $wallet)
    {
        $this->bitgo->setWalletId($wallet->getId());
        $url = $this->transactionWebhookUrl();
        $this->bitgo->removeWalletWebhook($url, "transfer");
    }

    /**
     * @return int
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    public function getFeePerByteEstimate()
    {
        return ($this->bitgo->feeEstimate()['feePerKb'] / 1000);
    }

}
