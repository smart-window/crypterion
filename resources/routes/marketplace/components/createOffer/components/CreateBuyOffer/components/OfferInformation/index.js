import React, {Component} from 'react';
import {Alert} from "antd";
import {FormattedMessage} from "react-intl";
import {upperCase} from "lodash";
import {currencyFormat} from "support/utils/common";

class OfferInformation extends Component {
	getMinimumAmount() {
		const {getFieldValue} = this.props.form;
		const currency = getFieldValue('currency');
		const amount = getFieldValue('min_amount');
		if (!amount) return;
		return currencyFormat(amount, currency)
	}

	getMaximumAmount() {
		const {getFieldValue} = this.props.form;
		const currency = getFieldValue('currency');
		const amount = getFieldValue('max_amount');
		if (!amount) return;
		return currencyFormat(amount, currency)
	}

	getMarketPricePercentage() {
		const {getFieldValue} = this.props.form;
		const profitMargin = getFieldValue('profit_margin');
		return 100 + (profitMargin || 0);
	}


	render() {
		const {
			form, marketplaceFee,
			paymentMethod, walletAccount,
		} = this.props;

		const currency = form.getFieldValue('currency');
		const minimumAmount = this.getMinimumAmount();
		const marketPricePercentage = this.getMarketPricePercentage();
		const maximumAmount = this.getMaximumAmount();

		return (
			<Alert type="info"
				message={
					<div>
						<div className="font-weight-medium">
							<FormattedMessage
								defaultMessage="Offer Information"
								id="create_offer.buy_offer_information"/>
						</div>
						<ol className="mt-1 pl-3 mb-0">
							{walletAccount && (
								<li>
									<FormattedMessage
										defaultMessage="You are buying coin for your {wallet} account"
										id="create_offer.buy_summary_wallet_account_information"
										values={{
											wallet : (
												<b>{walletAccount.wallet.coin.name}</b>
											)
										}}/>
								</li>
							)}

							{paymentMethod && (
								<li>
									<FormattedMessage
										defaultMessage="You want to pay with {method}"
										id="create_offer.buy_summary_payment_method_information"
										values={{
											method : (
												<b>{paymentMethod.name}</b>
											)
										}}/>
								</li>
							)}

							{marketplaceFee && (
								<li>
									<FormattedMessage
										defaultMessage="The escrow fee for your selected payment method is {fee}%"
										id="create_offer.sell_summary_escrow_fee_information"
										values={{
											fee : (
												<b>{marketplaceFee}</b>
											)
										}}/>
								</li>
							)}

							{currency && (
								<li>
									<FormattedMessage
										defaultMessage="Your preferred currency of trade is {currency}"
										id="create_offer.buy_summary_currency_information"
										values={{
											currency : (
												<b>{upperCase(currency)}</b>
											)
										}}/>
								</li>
							)}

							{minimumAmount && !maximumAmount && (
								<li>
									<FormattedMessage
										defaultMessage={
											"You accept trade starting from {minimum}!"
										}
										id="create_offer.buy_summary_minimum_amount_information"
										values={{
											minimum : <b>{minimumAmount}</b>,
										}}/>
								</li>
							)}

							{maximumAmount && minimumAmount && (
								<li>
									<FormattedMessage
										defaultMessage={
											"You accept trade between {minimum} and {maximum}!"
										}
										id="create_offer.buy_summary_amount_range_information"
										values={{
											minimum : <b>{minimumAmount}</b>,
											maximum : <b>{maximumAmount}</b>,
										}}/>
								</li>
							)}
						</ol>
					</div>

				}
				showIcon/>
		);
	}
}

export default OfferInformation;