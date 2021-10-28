<?php

namespace App\Http\Resources;

use App\Models\MarketplaceTrade as MarketplaceTradeModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;

class MarketplaceTrade extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return array|ArrayObject
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof MarketplaceTradeModel)) {
			return null;
		}

		return [
			'id'                         => $this->id,
			'rate'                       => $this->rate,
			'formatted_rate'             => $this->formatted_rate,
			'chat'                       => new Chat($this->whenLoaded('chat')),
			'offer'                      => new MarketplaceOffer($this->whenLoaded('offer')),
			'offer_amount'               => $this->offer_amount,
			'formatted_offer_amount'     => $this->formatted_offer_amount,
			'fee'                        => $this->fee,
			'fee_price'                  => $this->fee_price,
			'formatted_fee_price'        => $this->formatted_fee_price,
			'amount'                     => $this->amount,
			'amount_price'               => $this->amount_price,
			'formatted_amount_price'     => $this->formatted_amount_price,
			'country'                    => $this->country,
			'created_at'                 => $this->created_at,
			'confirmed_at'               => $this->confirmed_at,
			'cancels_at'                 => $this->cancels_at,
			'currency'                   => $this->currency,
			'payment_method_name'        => $this->payment_method_name,
			'payment_method_description' => $this->payment_method_description,
			'terms'                      => $this->terms,
			'instructions'               => $this->instructions,
			'buyer'                      => new User($this->whenLoaded('buyer')),
			'buyer_id'                   => $this->buyer_id,
			'seller'                     => new User($this->whenLoaded('seller')),
			'seller_id'                  => $this->seller_id,
			'dispute_by'                => $this->when($this->status == 'dispute', new User($this->whenLoaded('disputeBy'))),
			'label'                      => $this->label,
			'chat_id'                    => $this->chat_id,
			'status'                     => $this->status,
			'seller_rateable'            => $this->seller_rateable,
			'buyer_rateable'             => $this->buyer_rateable,
			'coin_name'                  => $this->walletAccount->wallet->coin->name,
			'coin_precision'             => $this->walletAccount->wallet->coin->precision,
			'coin_symbol'                => $this->walletAccount->wallet->coin->symbol,
		];
	}
}
