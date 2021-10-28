<?php

namespace HolluwaTosin360\BitGoPHP;

use Carbon\Carbon;
use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\GuzzleException;
use Psr\Http\Message\ResponseInterface;


class BitGo
{
	/**
	 * @var Client
	 */
	private $client;

	/**
	 * @var string
	 */
	private $hostname;

	/**
	 * @var int
	 */
	private $port;

	/**
	 * @var string
	 */
	private $coin;

	/**
	 * @var string
	 */
	private $walletId;

	/**
	 * @var string
	 */
	private $accessToken;

	/**
	 * @var Carbon
	 */
	private $expiresAt;

	/**
	 * BitGoExpress Initialization
	 *
	 * @param string $hostname Set the hostname of your BitGo Express instance
	 * @param int $port Set the port of your BitGo Express instance
	 * @param string|null $accessToken
	 * @param Carbon|null $expiresAt
	 */
	public function __construct(string $hostname, int $port, $accessToken = null, Carbon $expiresAt = null)
	{
		$this->hostname = $hostname;
		$this->port = $port;
		$this->accessToken = $accessToken;
		$this->expiresAt = $expiresAt;

		$this->client = new Client([
			'base_uri' => $this->hostname . ':' . $this->port . '/api/v2/'
		]);
	}

	public function setCoin($coin = Coin::BITCOIN)
	{
		if (!$this->coinIsAllowed($coin)) {
			throw new Exception('Invalid coin identifier set!');
		}

		$this->coin = $coin;
	}

	public function getCoin()
	{
		if (!isset($this->coin)) {
			throw new Exception('Valid BitGo coin identifier needs to be set!');
		}

		return $this->coin;
	}

	/**
	 * Check if coin is allowed
	 *
	 * @param $coin
	 * @return bool
	 */
	private function coinIsAllowed($coin)
	{
		return in_array($coin, Coin::all());
	}

	/**
	 * Check if coin is UTXO based
	 * @param $coin
	 * @return bool
	 * @throws Exception
	 */
	private function coinIsUTXOBased()
	{
		return in_array($this->getCoin(), Coin::$UTXOBased);
	}

	/**
	 * This API call retrieves information about the current session access token.
	 *
	 * @return array
	 * @throws GuzzleException
	 */
	public function getSessionInfo()
	{
		return $this->execute('user/session', 'GET');
	}

	/**
	 * Get a token for first-party access to the BitGo API. First-party access is only intended for users accessing their own BitGo accounts.
	 *
	 * @param string $email The user’s email address
	 * @param string $password The user’s password
	 * @param string $otp The 2nd-factor-authentication token
	 * @param bool $extensible True if the session is supposed to be extensible beyond a one-hour duration.
	 * @return array
	 * @throws GuzzleException
	 * @throws Exception
	 */
	public function login(string $email, string $password, string $otp, bool $extensible = null)
	{
		$response = $this->__execute('user/login', 'POST', [
			'email'      => $email,
			'password'   => $password,
			'otp'        => $otp,
			'extensible' => $extensible
		]);

		$body = json_decode($response->getBody(), true);

		if ($response->getStatusCode() == 200) {
			$this->accessToken = $body['access_token'];
			$this->expiresAt = $body['expires_at'];
		}

		return $response;
	}

	/**
	 * Ping bitgo express to ensure that it is still running. Unlike /ping, this does not try connecting to bitgo.com.
	 *
	 * @return array
	 * @throws GuzzleException
	 */
	public function ping()
	{
		return $this->execute('ping', 'GET');
	}

	/**
	 * This API call creates a new wallet.
	 *
	 * @param string $label Human-readable name for the wallet.
	 * @param string $passphrase Passphrase to decrypt the wallet’s private key.
	 * @param string $userKey Optional xpub to be used as the user key.
	 * @param string $backupXpub Optional xpub to be used as the backup key.
	 * @param string $backupXpubProvider Optional key recovery service to provide and store the backup key.
	 * @param string $enterprise ID of the enterprise to associate this wallet with.
	 * @param bool $disableTransactionNotifications Will prevent wallet transaction notifications if set to true.
	 * @param int $gasPrice Custom gas price to be used for the deployment of the wallet (only for Ethereum)
	 * @param string $passcodeEncryptionCode Encryption code for wallet passphrase (used for lost passphrase recovery)
	 * @return array
	 * @throws GuzzleException
	 */
	public function generateWallet(string $label, string $passphrase, string $userKey = null, string $backupXpub = null, string $backupXpubProvider = null, string $enterprise = null, bool $disableTransactionNotifications = null, int $gasPrice = null, string $passcodeEncryptionCode = null)
	{
		return $this->execute($this->getCoin() . '/wallet/generate', 'POST', [
			'label'                           => $label,
			'passphrase'                      => $passphrase,
			'userKey'                         => $userKey,
			'backupXpub'                      => $backupXpub,
			'backupXpubProvider'              => $backupXpubProvider,
			'enterprise'                      => $enterprise,
			'disableTransactionNotifications' => $disableTransactionNotifications,
			'gasPrice'                        => $this->getCoin() === Coin::ETHEREUM ? $gasPrice : 0,
			'passcodeEncryptionCode'          => $passcodeEncryptionCode
		]);
	}

	/**
	 * This API call is used to create a new receive address for your wallet, which enhances your privacy.
	 *
	 * @param bool $allowMigrated Set to true to enable address creation for migrated BCH wallets.
	 * @param int $chain Specifies the address format, defaults to 0, use 10 for SegWit (only on BTC and BTG)
	 * @param int $gasPrice Custom gas price to be used for deployment of receive addresses (only for Ethereum)
	 * @param string $label Human-readable name for the address
	 * @return array
	 * @throws GuzzleException
	 */
	public function createWalletAddress(bool $allowMigrated = false, int $chain = 0, int $gasPrice = null, string $label = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/address', 'POST', [
			'id'            => $this->walletId,
			'allowMigrated' => $allowMigrated,
			'chain'         => $this->coin === Coin::BITCOIN || $this->coin === Coin::BITCOIN_GOLD ? $chain : 0,
			'gasPrice'      => $this->coin === Coin::ETHEREUM ? $gasPrice : null,
			'label'         => $label
		]);
	}

	/**
	 * This API creates a new wallet for the user.
	 * The keys to use with the new wallet (passed in the ‘keys’ parameter) must be registered with BitGo prior to using this API.
	 *
	 * @param string $label Human-readable name for the wallet.
	 * @param int $m Number of signatures required for wallet (must be 2).
	 * @param int $n Number of total signers on wallet (must be 3).
	 * @param array $keys Array of keychain IDs previously created using Keychain API. There must be three IDs in the following order: user key, backup key, and BitGo key.
	 * @param string $enterprise ID of the enterprise to associate this wallet with.
	 * @param bool $isCold Whether the wallet is a cold wallet (BitGo only knows public portion of user key).
	 * @param bool $disableTransactionNotifications Will prevent wallet transaction notifications if set to true.
	 * @return array
	 * @throws GuzzleException
	 */
	public function addWallet(string $label, int $m, int $n, array $keys, string $enterprise = null, bool $isCold = null, bool $disableTransactionNotifications = null)
	{
		return $this->execute($this->getCoin() . '/wallet', 'POST', [
			'label'                           => $label,
			'm'                               => $m,
			'n'                               => $n,
			'keys'                            => $keys,
			'enterprise'                      => $enterprise,
			'isCold'                          => $isCold,
			'disableTransactionNotifications' => $disableTransactionNotifications
		]);
	}

	/**
	 * Add a webhook that will result in an HTTP callback at the specified URL from BitGo when events are triggered.
	 *
	 * @param string $url URL to fire the webhook to.
	 * @param string $type Type of event to listen to (can be 'transfer' or 'pendingaapproval').
	 * @param int $numConfirmations Number of confirmations before triggering the webhook. If 0 or unspecified, requests will be sent to the callback endpoint when the transfer is first seen and when it is confirmed.
	 * @return array
	 * @throws GuzzleException
	 */
	public function addWalletWebhook(string $url, string $type, int $numConfirmations = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/webhooks', 'POST', [
			'url'              => $url,
			'type'             => $type,
			'numConfirmations' => $numConfirmations
		]);
	}

	/**
	 * Removing a webhook will cause new events of the specified type to no longer trigger HTTP callbacks to your URLs.
	 *
	 * @param string $url URL for callback requests to be made at.
	 * @param string $type Type of event to listen to (can be 'transfer' or 'pendingaapproval').
	 * @return array
	 * @throws GuzzleException
	 */
	public function removeWalletWebhook(string $url, string $type)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/webhooks', 'DELETE', [
			'url'  => $url,
			'type' => $type
		]);
	}

	/**
	 * This API call allows you to create and send cryptocurrency to a destination address.
	 *
	 * @param string $address Recipient address
	 * @param int $amount Amount to be sent to the recipient
	 * @param string $walletPassphrase The passphrase to be used to decrypt the user key on this wallet
	 * @param string $prv The private key in string form if the walletPassphrase is not available
	 * @param int $numBlocks Estimates the approximate fee per kilobyte necessary for a transaction confirmation within 'numBlocks' blocks.
	 * @param int $feeRate Fee rate in satoshis/litoshis/atoms per kilobyte.
	 * @param string $comment Any additional comment to attach to the transaction
	 * @param array $unspents The unspents to use in the transaction. Each unspent should be in the form prevTxId:nOutput.
	 * @param int $minConfirms Minimum number of confirmations unspents going into this transaction should have.
	 * @param bool $enforceMinConfirmsForChange Enforce minimum number of confirmations on change (internal) inputs.
	 * @param int $targetWalletUnspents The desired count of unspents in the wallet. If the wallet’s current unspent count is lower than the target, up to four additional change outputs will be added to the transaction. To reduce unspent count in your wallet see 'Consolidate Unspents’.
	 * @param bool $noSplitChange Set to true to disable automatic change splitting for purposes of unspent management.
	 * @param int $minValue Ignore unspents smaller than this amount of satoshis
	 * @param int $maxValue Ignore unspents larger than this amount of satoshis
	 * @param int $gasPrice Custom gas price to be used for sending the transaction
	 * @param int $gasLimit Custom gas limit for the transaction
	 * @param int $sequenceId The sequence ID of the transaction
	 * @param bool $segwit Allow SegWit unspents to be used, and create SegWit change.
	 * @param int $lastLedgerSequence Absolute max ledger the transaction should be accepted in, whereafter it will be rejected.
	 * @param string $ledgerSequenceDelta Relative ledger height (in relation to the current ledger) that the transaction should be accepted in, whereafter it will be rejected.
	 * @return array
	 * @throws GuzzleException
	 */
	public function sendTransaction(string $address, int $amount, string $walletPassphrase, string $prv = null, int $numBlocks = null, int $feeRate = null, string $comment = null, array $unspents = null, int $minConfirms = null, bool $enforceMinConfirmsForChange = null, int $targetWalletUnspents = null, bool $noSplitChange = null, int $minValue = null, int $maxValue = null, int $gasPrice = null, int $gasLimit = null, int $sequenceId = null, bool $segwit = null, int $lastLedgerSequence = null, string $ledgerSequenceDelta = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/sendcoins', 'POST', [
			'address'                     => $address,
			'amount'                      => $amount,
			'walletPassphrase'            => $walletPassphrase,
			'prv'                         => $prv,
			'numBlocks'                   => $this->coinIsUTXOBased() ? $numBlocks : null,
			'feeRate'                     => $this->coinIsUTXOBased() ? $feeRate : null,
			'comment'                     => $comment,
			'unspents'                    => $this->coinIsUTXOBased() ? $unspents : null,
			'minConfirms'                 => $this->coinIsUTXOBased() ? $minConfirms : null,
			'enforceMinConfirmsForChange' => $this->coinIsUTXOBased() ? $enforceMinConfirmsForChange : null,
			'targetWalletUnspents'        => $this->coinIsUTXOBased() ? $targetWalletUnspents : null,
			'noSplitChange'               => $this->coinIsUTXOBased() ? $noSplitChange : null,
			'minValue'                    => $this->coinIsUTXOBased() ? $minValue : null,
			'maxValue'                    => $this->coinIsUTXOBased() ? $maxValue : null,
			'gasPrice'                    => $this->getCoin() === Coin::ETHEREUM ? $gasPrice : null,
			'gasLimit'                    => $this->getCoin() === Coin::ETHEREUM ? $gasLimit : null,
			'sequenceId'                  => $this->getCoin() === Coin::ETHEREUM ? $sequenceId : null,
			'segwit'                      => in_array($this->getCoin(), [
				Coin::BITCOIN, Coin::LITECOIN, Coin::BITCOIN_GOLD
			]) ? $segwit : null,
			'lastLedgerSequence'          => $this->getCoin() === Coin::RIPPLE ? $lastLedgerSequence : null,
			'ledgerSequenceDelta'         => $this->getCoin() === Coin::RIPPLE ? $ledgerSequenceDelta : null
		]);
	}

	/**
	 * Estimate the transaction fee
	 *
	 * @param int $numBlocks
	 * @return array
	 * @throws GuzzleException
	 */
	public function feeEstimate(int $numBlocks = null)
	{
		return $this->execute($this->getCoin() . '/tx/fee', 'GET', [
			'numBlocks' => $numBlocks
		]);
	}

	/**
	 * Wallet transfers represent digital currency sends and receives on your wallet.
	 *
	 * @param string $transactionId ID of the wallet transfer
	 * @return array
	 * @throws GuzzleException
	 */
	public function getWalletTransfer(string $transactionId)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/transfer/' . $transactionId, 'GET');
	}

	/**
	 * This API call allows you to create a transaction and send to multiple addresses.
	 * This may be useful if you schedule outgoing transactions in bulk, as you will be able to process multiple recipients and lower the aggregate amount of blockchain fees paid.
	 *
	 * @param array $recipients Array of recipient objects and the amount to send to each e.g. [{address: ‘38BKDNZbPcLogvVbcx2ekJ9E6Vv94DqDqw’, amount: 1500}, …]
	 * @param string $walletPassphrase The passphrase to be used to decrypt the user key on this wallet
	 * @param string $prv The private key in string form if the walletPassphrase is not available
	 * @param int $numBlocks Estimates the approximate fee per kilobyte necessary for a transaction confirmation within 'numBlocks' blocks.
	 * @param int $feeRate Fee rate in satoshis/litoshis/atoms per kilobyte.
	 * @param string $comment Any additional comment to attach to the transaction
	 * @param array $unspents The unspents to use in the transaction. Each unspent should be in the form prevTxId:nOutput.
	 * @param int $minConfirms Minimum number of confirmations unspents going into this transaction should have.
	 * @param bool $enforceMinConfirmsForChange Enforce minimum number of confirmations on change (internal) inputs.
	 * @param int $targetWalletUnspents The desired count of unspents in the wallet. If the wallet’s current unspent count is lower than the target, up to four additional change outputs will be added to the transaction. To reduce unspent count in your wallet see 'Consolidate Unspents’.
	 * @param bool $noSplitChange Set to true to disable automatic change splitting for purposes of unspent management.
	 * @param int $minValue Ignore unspents smaller than this amount of satoshis
	 * @param int $maxValue Ignore unspents larger than this amount of satoshis
	 * @param int $gasPrice Custom gas price to be used for sending the transaction
	 * @param int $gasLimit Custom gas limit for the transaction
	 * @param int $sequenceId The sequence ID of the transaction
	 * @param bool $segwit Allow SegWit unspents to be used, and create SegWit change.
	 * @param int $lastLedgerSequence Absolute max ledger the transaction should be accepted in, whereafter it will be rejected.
	 * @param string $ledgerSequenceDelta Relative ledger height (in relation to the current ledger) that the transaction should be accepted in, whereafter it will be rejected.
	 * @return array
	 * @throws GuzzleException
	 */
	public function sendTransactionToMany(array $recipients, string $walletPassphrase, string $prv = null, int $numBlocks = null, int $feeRate = null, string $comment = null, array $unspents = null, int $minConfirms = null, bool $enforceMinConfirmsForChange = null, int $targetWalletUnspents = null, bool $noSplitChange = null, int $minValue = null, int $maxValue = null, int $gasPrice = null, int $gasLimit = null, int $sequenceId = null, bool $segwit = null, int $lastLedgerSequence = null, string $ledgerSequenceDelta = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/sendmany', 'POST', [
			'recipients'                  => $recipients,
			'walletPassphrase'            => $walletPassphrase,
			'prv'                         => $prv,
			'numBlocks'                   => $this->coinIsUTXOBased() ? $numBlocks : null,
			'feeRate'                     => $this->coinIsUTXOBased() ? $feeRate : null,
			'comment'                     => $comment,
			'unspents'                    => $this->coinIsUTXOBased() ? $unspents : null,
			'minConfirms'                 => $this->coinIsUTXOBased() ? $minConfirms : null,
			'enforceMinConfirmsForChange' => $this->coinIsUTXOBased() ? $enforceMinConfirmsForChange : null,
			'targetWalletUnspents'        => $this->coinIsUTXOBased() ? $targetWalletUnspents : null,
			'noSplitChange'               => $this->coinIsUTXOBased() ? $noSplitChange : null,
			'minValue'                    => $this->coinIsUTXOBased() ? $minValue : null,
			'maxValue'                    => $this->coinIsUTXOBased() ? $maxValue : null,
			'gasPrice'                    => $this->getCoin() === Coin::ETHEREUM ? $gasPrice : null,
			'gasLimit'                    => $this->getCoin() === Coin::ETHEREUM ? $gasLimit : null,
			'sequenceId'                  => $this->getCoin() === Coin::ETHEREUM ? $sequenceId : null,
			'segwit'                      => in_array($this->getCoin(), [
				Coin::BITCOIN, Coin::LITECOIN, Coin::BITCOIN_GOLD
			]) ? $segwit : null,
			'lastLedgerSequence'          => $this->getCoin() === Coin::RIPPLE ? $lastLedgerSequence : null,
			'ledgerSequenceDelta'         => $this->getCoin() === Coin::RIPPLE ? $ledgerSequenceDelta : null
		]);
	}

	/**
	 * This SDK call will consolidate the unspents that match the parameters, and consolidate them into the number specified by 'numUnspentsToMake'.
	 *
	 * @param string $walletPassphrase Passphrase to decrypt the wallet’s private key.
	 * @param int $numUnspentsToMake Number of outputs created by the consolidation transaction (Defaults to 1)
	 * @param int $limit Number of unspents to select (Defaults to 25, Max is 200)
	 * @param int $minValue Ignore unspents smaller than this amount of satoshis
	 * @param int $maxValue Ignore unspents larger than this amount of satoshis
	 * @param int $minHeight The minimum height of unspents on the block chain to use
	 * @param int $feeRate The desired fee rate for the transaction in satoshis/kB
	 * @param int $feeTxConfirmTarget Fee rate is automatically chosen by targeting a transaction confirmation in this number of blocks (Only available on BTC, feeRate takes precedence if also set)
	 * @param int $maxFeePercentage Maximum percentage of an unspent’s value to be used for fees. Cannot be combined with minValue
	 * @param int $minConfirms The required number of confirmations for each transaction input
	 * @param bool $enforceMinConfirmsForChange Apply the required confirmations set in minConfirms for change outputs
	 * @return array
	 * @throws GuzzleException
	 */
	public function consolidateWalletUnspents(string $walletPassphrase, int $numUnspentsToMake = null, int $limit = null, int $minValue = null, int $maxValue = null, int $minHeight = null, int $feeRate = null, int $feeTxConfirmTarget = null, int $maxFeePercentage = null, int $minConfirms = null, bool $enforceMinConfirmsForChange = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/consolidateunspents', 'POST', [
			'walletPassphrase'            => $walletPassphrase,
			'numUnspentsToMake'           => $numUnspentsToMake,
			'limit'                       => $limit,
			'minValue'                    => $minValue,
			'maxValue'                    => $maxValue,
			'minHeight'                   => $minHeight,
			'feeRate'                     => $feeRate,
			'feeTxConfirmTarget'          => $this->getCoin() === Coin::BITCOIN ? $feeTxConfirmTarget : null,
			'maxFeePercentage'            => !isset($minValue) ? $maxFeePercentage : null,
			'minConfirms'                 => $minConfirms,
			'enforceMinConfirmsForChange' => $enforceMinConfirmsForChange
		]);
	}

	/**
	 * This SDK call will fanout the unspents currently in the wallet that match the parameters, and use them as inputs to create more unspents.
	 *
	 * @param string $walletPassphrase Passphrase to decrypt the wallet’s private key.
	 * @param string $xprv The private key in string form if the walletPassphrase is not available
	 * @param int $maxNumInputsToUse Number of unspents you want to use in the fanout transaction (Default 20, Max 80)
	 * @param int $numUnspentsToMake Number of unspents you want to create in the transaction. They will all be almost the same size. (Default 200, Max 300)
	 * @param int $minValue Ignore unspents smaller than this amount of satoshis
	 * @param int $maxValue Ignore unspents larger than this amount of satoshis
	 * @param int $minHeight The minimum height of unspents on the block chain to use
	 * @param int $maxFeePercentage Maximum percentage of an unspent’s value to be used for fees. Cannot be combined with minValue
	 * @param int $minConfirms The required number of confirmations for each transaction input
	 * @param bool $enforceMinConfirmsForChange Apply the required confirmations set in minConfirms for change outputs
	 * @param int $feeRate The desired fee rate for the transaction in satoshis/kB
	 * @param int $feeTxConfirmTarget Fee rate is automatically chosen by targeting a transaction confirmation in this number of blocks (Only available on BTC, feeRate takes precedence if also set)
	 * @return array
	 * @throws GuzzleException
	 */
	public function fanoutWalletUnspents(string $walletPassphrase, string $xprv = null, int $maxNumInputsToUse = null, int $numUnspentsToMake = null, int $minValue = null, int $maxValue = null, int $minHeight = null, int $maxFeePercentage = null, int $minConfirms = null, bool $enforceMinConfirmsForChange = null, int $feeRate = null, int $feeTxConfirmTarget = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/fanoutunspents', 'POST', [
			'walletPassphrase'            => $walletPassphrase,
			'xprv'                        => $xprv,
			'maxNumInputsToUse'           => $maxNumInputsToUse,
			'numUnspentsToMake'           => $numUnspentsToMake,
			'minValue'                    => $minValue,
			'maxValue'                    => $maxValue,
			'minHeight'                   => $minHeight,
			'maxFeePercentage'            => !isset($minValue) ? $maxFeePercentage : null,
			'minConfirms'                 => $minConfirms,
			'enforceMinConfirmsForChange' => $enforceMinConfirmsForChange,
			'feeRate'                     => $feeRate,
			'feeTxConfirmTarget'          => $this->getCoin() === Coin::BITCOIN ? $feeTxConfirmTarget : null
		]);
	}

	/**
	 * his SDK call attempts to move all of the funds of the wallet into the address provided.
	 *
	 * @param string $address The address to send all the funds in the wallet to.
	 * @param string $walletPassphrase Passphrase to decrypt the wallet’s private key.
	 * @param string $xprv The private key in string form if the walletPassphrase is not available
	 * @param string $otp The current 2FA code
	 * @param int $feeRate Fee rate in satoshis/litoshis/atoms per kilobyte
	 * @param int $feeTxConfirmTarget Estimates the approximate fee per kilobyte necessary for a transaction confirmation within 'numBlocks' blocks.
	 * @param int $gasPrice Custom gas price to be used for sending the transaction
	 * @param int $sequenceId The sequence ID of the transaction
	 * @param int $lastLedgerSequence Absolute max ledger the transaction should be accepted in, whereafter it will be rejected.
	 * @param string $ledgerSequenceDelta Relative ledger height (in relation to the current ledger) that the transaction should be accepted in, whereafter it will be rejected.
	 * @return array
	 * @throws GuzzleException
	 */
	public function sweep(string $address, string $walletPassphrase, string $xprv = null, string $otp = null, int $feeRate = null, int $feeTxConfirmTarget = null, int $gasPrice = null, int $sequenceId = null, int $lastLedgerSequence = null, string $ledgerSequenceDelta = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/sweep', 'POST', [
			'address'             => $address,
			'walletPassphrase'    => $walletPassphrase,
			'xprv'                => $xprv,
			'otp'                 => $otp,
			'feeRate'             => $this->coinIsUTXOBased() ? $feeRate : null,
			'feeTxConfirmTarget'  => $this->coinIsUTXOBased() ? $feeTxConfirmTarget : null,
			'gasPrice'            => $this->getCoin() === Coin::ETHEREUM ? $gasPrice : null,
			'sequenceId'          => $sequenceId,
			'lastLedgerSequence'  => $this->getCoin() === Coin::RIPPLE ? $lastLedgerSequence : null,
			'ledgerSequenceDelta' => $this->getCoin() === Coin::RIPPLE ? $ledgerSequenceDelta : null
		]);
	}

	/**
	 * Create a transaction with the specified parameters. This builds a transaction object, but does not sign or send it.
	 *
	 * @param array $recipients List of recipients in array
	 * @param int $numBlocks Estimates the approximate fee per kilobyte necessary for a transaction confirmation within 'numBlocks' blocks.
	 * @param int $feeRate Fee rate in satoshis/litoshis/atoms per kilobyte.
	 * @param int $minConfirms Minimum number of confirmations unspents going into this transaction should have.
	 * @param bool $enforceMinConfirmsForChange Enforce minimum number of confirmations on change (internal) inputs.
	 * @param array $unspents The unspents to use in the transaction. Each unspent should be in the form prevTxId:nOutput.
	 * @param int $targetWalletUnspents The desired count of unspents in the wallet. If the wallet’s current unspent count is lower than the target, up to four additional change outputs will be added to the transaction. To reduce unspent count in your wallet see 'Consolidate Unspents’.
	 * @param bool $noSplitChange Set to true to disable automatic change splitting for purposes of unspent management.
	 * @param int $minValue Ignore unspents smaller than this amount of satoshis
	 * @param int $maxValue Ignore unspents larger than this amount of satoshis
	 * @param int $gasPrice Custom gas price to be used for sending the transaction
	 * @param int $lastLedgerSequence Absolute max ledger the transaction should be accepted in, whereafter it will be rejected.
	 * @param string $ledgerSequenceDelta Relative ledger height (in relation to the current ledger) that the transaction should be accepted in, whereafter it will be rejected.
	 * @return object                           Returns the newly created transaction description object.
	 * @throws GuzzleException
	 */
	public function buildTransaction(array $recipients, int $numBlocks = null, int $feeRate = null, int $minConfirms = null, bool $enforceMinConfirmsForChange = null, array $unspents = null, int $targetWalletUnspents = null, bool $noSplitChange = null, int $minValue = null, int $maxValue = null, int $gasPrice = null, int $lastLedgerSequence = null, string $ledgerSequenceDelta = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/tx/build', 'POST', [
			'recipients'                  => $recipients,
			'numBlocks'                   => $this->coinIsUTXOBased() ? $numBlocks : null,
			'feeRate'                     => $this->coinIsUTXOBased() ? $feeRate : null,
			'minConfirms'                 => $this->coinIsUTXOBased() ? $minConfirms : null,
			'enforceMinConfirmsForChange' => $this->coinIsUTXOBased() ? $enforceMinConfirmsForChange : null,
			'unspents'                    => $this->coinIsUTXOBased() ? $unspents : null,
			'targetWalletUnspents'        => $this->coinIsUTXOBased() ? $targetWalletUnspents : null,
			'noSplitChange'               => $this->coinIsUTXOBased() ? $noSplitChange : null,
			'minValue'                    => $this->coinIsUTXOBased() ? $minValue : null,
			'maxValue'                    => $this->coinIsUTXOBased() ? $maxValue : null,
			'gasPrice'                    => $this->getCoin() === Coin::ETHEREUM ? $gasPrice : null,
			'lastLedgerSequence'          => $this->getCoin() === Coin::RIPPLE ? $lastLedgerSequence : null,
			'ledgerSequenceDelta'         => $this->getCoin() === Coin::RIPPLE ? $ledgerSequenceDelta : null
		]);
	}

	/**
	 * Sign the given transaction with the specified keychain. All signing is done locally and can be performed offline.
	 * Signing can happen two ways: with a prv argument representing the private key, or with keychain and walletPassphrase arguments (for signing with an encrypted private key).
	 *
	 * @param object $txPrebuild The transaction description object, output from 'Build Transaction’
	 * @param string $prv The user private key
	 * @param string $coldDerivationSeed The seed used to derive the signing key
	 * @param object $keychain The user keychain with an 'encryptedPrv' property
	 * @param string $walletPassphrase Passphrase to decrypt the user keychain
	 * @return object                       The half-signed, serialized transaction hex
	 * @throws GuzzleException
	 */
	public function signBuildTransaction($txPrebuild, string $prv = null, string $coldDerivationSeed = null, $keychain = null, string $walletPassphrase = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/signtx', 'POST', [
			'txPrebuild'         => $txPrebuild,
			'prv'                => $prv,
			'coldDerivationSeed' => $coldDerivationSeed,
			'keychain'           => $keychain,
			'walletPassphrase'   => $walletPassphrase
		]);
	}

	/**
	 * Submit a half-signed transaction.
	 *
	 * @param object $halfSigned The half-signed info returned from 'Sign Transaction’
	 * @param string $otp The current 2FA code
	 * @param string $txHex The half-signed, serialized transaction hex (alternative to halfSigned)
	 * @param string $comment Any additional comment to attach to the transaaction
	 * @return array
	 * @throws GuzzleException
	 */
	public function sendBuildTransaction($halfSigned, string $otp, string $txHex = null, string $comment = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/tx/send', 'POST', [
			'halfSigned' => $halfSigned,
			'otp'        => $otp,
			'txHex'      => $txHex,
			'comment'    => $comment
		]);
	}

	/**
	 * Local client-side function to create a new keychain.
	 *
	 * @return array
	 * @throws GuzzleException
	 */
	public function createKeychain()
	{
		return $this->execute($this->getCoin() . '/keychain/local', 'POST');
	}

	/**
	 * Sharing a wallet involves giving another user permission to use the wallet through BitGo.
	 *
	 * @param string $email Email of the user to share the wallet with
	 * @param string $permissions Comma-separated list of permissions, e.g. view,spend,admin
	 * @param string $walletPassphrase Passphrase on the wallet being shared
	 * @param bool $skipKeychain Set to true if sharing a wallet with another user who will obtain the keychain out-of-band
	 * @param bool $disableEmail Set to true to prevent a notification email sent to the user added
	 * @return array
	 * @throws GuzzleException
	 */
	public function shareWallet(string $email, string $permissions, string $walletPassphrase = null, bool $skipKeychain = null, bool $disableEmail = null)
	{
		return $this->execute($this->getCoin() . '/wallet/' . $this->walletId . '/share', 'POST', [
			'email'            => $email,
			'permissions'      => $permissions,
			'walletPassphrase' => $walletPassphrase,
			'skipKeychain'     => $skipKeychain,
			'disableEmail'     => $disableEmail
		]);
	}

	/**
	 * Client-side operation to accept a wallet share.
	 *
	 * @param string $walletShareId The incoming wallet share ID to accept
	 * @param string $newWalletPassphrase The passphrase to set on the wallet, for use during future spends
	 * @param string $userPassword The user’s password to decrypt the shared private key
	 * @param string $overrideEncryptedPrv Set to an alternate encrypted prv if you wish to store an encrypted prv received out-of-band
	 * @return array
	 * @throws GuzzleException
	 */
	public function acceptWalletShare(string $walletShareId, string $newWalletPassphrase = null, string $userPassword = null, string $overrideEncryptedPrv = null)
	{
		return $this->execute($this->getCoin() . '/walletshare/' . $walletShareId . '/acceptshare', 'POST', [
			'walletShareId'        => $walletShareId,
			'newWalletPassphrase'  => $newWalletPassphrase,
			'userPassword'         => $userPassword,
			'overrideEncryptedPrv' => $overrideEncryptedPrv
		]);
	}

    /**
     * Get pending approval
     *
     * @param string $pendingApprovalId Pending approval id.
     * @return array
     * @throws GuzzleException
     */
    public function getPendingApproval(string $pendingApprovalId)
    {
        return $this->execute('pendingApprovals/' . $pendingApprovalId, 'GET');
    }

	/**
	 * Symmetrically encrypt an arbitrary message with provided password
	 *
	 * @param string $input Plaintext message which should be encrypted
	 * @param string $password Password which should be used to encrypt message
	 * @return string
	 * @throws GuzzleException
	 */
	public function encrypt(string $input, string $password)
	{
		return $this->execute('encrypt', 'POST', [
			'input'    => $input,
			'password' => $password
		]);
	}

	/**
	 * Decrypt a ciphertext generated by encrypt route with provided password
	 *
	 * @param string $input Ciphertext to decrypt
	 * @param string $password Key which is used for decryption
	 * @return string
	 * @throws GuzzleException
	 */
	public function decrypt(string $input, string $password)
	{
		return $this->execute('decrypt', 'POST', [
			'input'    => $input,
			'password' => $password
		]);
	}

	/**
	 * Verify address for a given coin
	 *
	 * @param string $address Address which should be verified for correct format
	 * @return array
	 * @throws GuzzleException
	 */
	public function verifyAddress(string $address)
	{
		return $this->execute($this->getCoin() . '/verifyaddress', 'POST', [
			'address' => $address
		]);
	}

	/**
	 * @return bool
	 */
	private function shouldAuthorize()
	{
		$tokenIsSet = $this->accessToken;

		if ($this->expiresAt instanceof Carbon) {
			return $tokenIsSet && !$this->expiresAt->isPast();
		}

		return $tokenIsSet;
	}

	/**
	 * @param string $id
	 */
	public function setWalletId($id)
	{
		$this->walletId = $id;
	}

	/**
	 * @param $uri
	 * @param string $method
	 * @param null $body
	 * @param array $options
	 * @return mixed
	 * @throws GuzzleException
	 */
	private function execute($uri, $method = 'POST', $body = null, array $options = [])
	{
		$response = $this->__execute($uri, $method, $body, $options);

		return json_decode($response->getBody(), true);
	}

	/**
	 * @param string $uri
	 * @param string $method
	 * @param array $body
	 * @param array $options
	 * @return mixed|ResponseInterface
	 * @throws GuzzleException
	 * @throws BitGoException
	 */
	private function __execute($uri, $method = 'POST', $body = null, array $options = [])
	{
		try {
			if (is_array($body)) {
				$options = array_merge($options, [
					'json' => array_filter($body)
				]);
			} else if (is_string($body)) {
				$options = array_merge($options, [
					'body' => $body
				]);
			}

			if ($this->shouldAuthorize()) {
				$options['headers'] = array_merge($options['headers'] ?? [], [
					'Authorization' => "Bearer {$this->accessToken}"
				]);
			}

			return $this->client->request($method, $uri, $options);
		} catch (ConnectException $e) {
			abort(422, 'Unable to connect with BitGo Express!');
		} catch (ClientException $e) {
			$response = $e->getResponse();
			$body = json_decode($response->getBody(), true);
			$code = $response->getStatusCode();

			if (!isset($body['error'])) {
				abort($code, $response->getBody());
			}else{
				abort($code, $body['error']);
			}
		}
	}

}
