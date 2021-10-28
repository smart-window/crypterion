<?php

namespace App\Http\Resources;

use App\Models\MarketplaceOffer as MarketplaceOfferModel;
use ArrayObject;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class MarketplaceOffer extends JsonResource
{
	/**
	 * Transform the resource into an array.
	 *
	 * @param \Illuminate\Http\Request $request
	 * @return array|ArrayObject
	 */
	public function toArray($request)
	{
		if (!($this->resource instanceof MarketplaceOfferModel)) {
			return null;
		}

		return [
			'id'                         => $this->id,
			'user'                       => new User($this->walletAccount->user),
			'confirmation_time_frame'    => $this->confirmation_time_frame,
			'country'                    => $this->country,
			'created_at'                 => $this->created_at,
			'currency'                   => $this->currency,
			'fee'                        => $this->fee,
			'filter_users'               => $this->filter_users,
			'instructions'               => $this->instructions,
			'label'                      => $this->label,
			'real_max_amount'            => $this->real_max_amount,
			'formatted_real_max_amount'  => $this->formatted_real_max_amount,
			'rate'                       => $this->rate,
			'formatted_rate'             => $this->formatted_rate,
			'min_amount'                 => $this->min_amount,
			'max_amount'                 => $this->max_amount,
			'formatted_min_amount'       => $this->formatted_min_amount,
			'payment_method'             => $this->paymentMethod,
			'profit_margin'              => $this->profit_margin,
			'require_email_verification' => $this->require_email_verification,
			'require_phone_verification' => $this->require_phone_verification,
			'slug'                       => $this->slug,
			'status'                     => $this->status,
			'tags'                       => $this->tags,
			'terms'                      => $this->terms,
			'type'                       => $this->type,
			'privacy'                    => $this->privacy,
			'visibility'                 => $this->visibility,
			'title'                      => $this->title,
			'coin_name'                  => $this->walletAccount->wallet->coin->name,
			'coin_precision'             => $this->walletAccount->wallet->coin->precision,
			'coin_symbol'                => $this->walletAccount->wallet->coin->symbol,
			'wallet_account'             => $this->when(
				Auth::check() && (
					Auth::user()->is($this->walletAccount->user) ||
					Auth::user()->can('manage_marketplace')
				),
				function () {
					return $this->walletAccount;
				}
			),
		];
	}
}


