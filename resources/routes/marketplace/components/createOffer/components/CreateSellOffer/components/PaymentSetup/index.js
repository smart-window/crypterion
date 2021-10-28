import React, {Component} from 'react';
import {Col, Form, Row, Select} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {groupBy, keys} from "lodash";
import Auth from "support/Auth";
import OfferInformation from "../OfferInformation";
import Flag from "components/Flag";

const {Option, OptGroup} = Select;

const messages = defineMessages({
	paymentMethod : {
		defaultMessage : "Select payment method...",
		id             : "create_offer.sell_select_payment_method_placeholder"
	},

	currency : {
		defaultMessage : "Select currency...",
		id             : "create_offer.sell_select_currency_placeholder"
	},

	walletAccount : {
		defaultMessage : "Select wallet account...",
		id             : "create_offer.sell_select_wallet_account_placeholder"
	}
});

class PaymentSetup extends Component {
	render() {
		const {getFieldDecorator} = this.props.form;

		const {
			intl, accounts, currencies,
			paymentMethods, marketplaceFee,
			auth, form, visible,
			paymentMethod, walletAccount
		} = this.props;

		const groupedPaymentMethods = groupBy(paymentMethods, (o) => {
			return o.category.name;
		});


		const userLocation = auth.user.location;

		return (
			<Row className={`${visible ? 'd-block' : 'd-none'}`}>
				<Col xl={16} className="mb-3">
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Sell from Wallet Account"
							           id="create_offer.sell_select_wallet_account_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "Select your wallet account to sell from!"
							           }
							           id="create_offer.sell_select_wallet_account_extra"/>
					           }>
						{getFieldDecorator('wallet_account', {
							rules : [
								{required : true},
							],
						})(
							<Select showSearch
							        placeholder={intl.formatMessage(messages.walletAccount)}
							        optionFilterProp="children">
								{accounts.map((account) => (
									<Option key={account.id} value={account.id}>
										{account.wallet.coin.name}
									</Option>
								))}
							</Select>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Receive payment with"
							           id="create_offer.sell_select_payment_method_label"/>
					           }>
						{getFieldDecorator('payment_method', {
							rules : [
								{required : true},
							],
						})(
							<Select showSearch
							        placeholder={intl.formatMessage(messages.paymentMethod)}
							        optionFilterProp="children">
								{keys(groupedPaymentMethods).map((category, index) => (
									<OptGroup key={index} label={category}>
										{groupedPaymentMethods[category].map((method) => (
											<Option key={method.id} value={method.id}>
												{method.name}
											</Option>
										))}
									</OptGroup>
								))}
							</Select>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Specify currency to trade with"
							           id="create_offer.sell_select_currency_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "Your offer will be posted for the selected currency."
							           }
							           id="create_offer.sell_select_currency_extra"/>
					           }>
						{getFieldDecorator('currency', {
							rules : [
								{required : true},
							],
						})(
							<Select showSearch
							        placeholder={intl.formatMessage(messages.currency)}
							        optionFilterProp="children">
								{keys(currencies).map((code) => (
									<Option key={code} value={code}>
										{currencies[code].name} ({currencies[code].code})
									</Option>
								))}
							</Select>
						)}
					</Form.Item>
				</Col>

				<Col xl={8}>
					<div className="px-xl-3 ml-xl-3 cp-border-left-xl">
						<h1>
							<FormattedMessage
								defaultMessage="About this page"
								id="create_offer.sell_about_page"/>
						</h1>

						<p className="text-justify">
							<FormattedMessage
								defaultMessage={
									"We provide support for several payment methods. " +
									"You can always suggest a new one for our team to consider. "
								}
								id="create_offer.sell_payment_method_information"/>
						</p>

						{userLocation && (
							<p className="text-justify">
								<FormattedMessage
									defaultMessage={
										"This offer will be listed under your country: " +
										"{country}. This is used to improve the search algorithm, " +
										"your offers will still be visible for all."
									}
									id="create_offer.sell_country_information"
									values={{
										country : (
											<b>
												<span className="mr-2">
													{userLocation.country}
												</span>
												<Flag code={userLocation.iso_code}/>
											</b>
										)
									}}/>
							</p>
						)}

						<div className="mt-4">
							<OfferInformation marketplaceFee={marketplaceFee}
							                  paymentMethod={paymentMethod}
							                  walletAccount={walletAccount}
							                  form={form}/>
						</div>
					</div>
				</Col>
			</Row>
		);
	}
}

const mapStateToProps = ({
	auth,
	collections : {
		currencies
	},
	wallet      : {
		accounts
	},
}) => ({
	accounts,
	auth : new Auth(auth),
	currencies,
});

export default pipe(
	connect(
		mapStateToProps
	)
)(PaymentSetup);