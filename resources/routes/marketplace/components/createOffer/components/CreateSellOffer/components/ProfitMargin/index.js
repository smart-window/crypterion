import React, {Component} from 'react';
import {Alert, Col, Form, Icon, InputNumber, Row, Select} from "antd";
import {FormattedMessage} from "react-intl";
import {currencyFormat, pipe} from "support/utils/common";
import Auth from "support/Auth";
import {connect} from "react-redux";
import OfferInformation from "../OfferInformation";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";

const {Option, OptGroup} = Select;

class ProfitMargin extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			marketPrice        : null,
			marketPriceLoading : false
		};
	}

	fetchMarketPrice = () => {
		const {axios, route} = this.api;
		const endpoint = route('marketplace.create-offer.price');
		const {walletAccount, form} = this.props;
		const {getFieldValue} = form;

		this.setState({marketPriceLoading : true});

		const data = {
			wallet   : walletAccount.wallet.id,
			currency : getFieldValue('currency')
		};

		axios.post(endpoint.url(), data)
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					marketPrice        : data.price,
					marketPriceLoading : false,
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({marketPriceLoading : false});
			}));
	};

	componentWillUnmount() {
		this.api.cancel()
	}

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
		const {marketPrice, marketPriceLoading} = this.state;

		const {
			intl, accounts, currencies, visible, form,
			marketplaceFee, paymentMethod, walletAccount
		} = this.props;

		const {getFieldDecorator, getFieldValue} = form;

		const minimumAmount = this.getMinimumAmount();
		const marketPricePercentage = this.getMarketPricePercentage();
		const maximumAmount = this.getMaximumAmount();

		const currency = getFieldValue('currency');

		return (
			<Row className={`${visible ? 'd-block' : 'd-none'}`}>
				<Col xl={16} className="mb-3">
					<Form.Item labelAlign="left"
					           wrapperCol={{xs : 16}}
					           labelCol={{xs : 8}}
					           label={
						           <FormattedMessage
							           defaultMessage="Margin"
							           id="create_offer.sell_input_margin_label"/>
					           }
					           extra={
						           <span className="d-flex align-items-center">
							           {(marketPrice && !isNaN(marketPricePercentage)) && (
								           <span className="mr-2">
									           <FormattedMessage
										           defaultMessage={
											           "The current market price is {marketPrice} while this offer will be sold for {price}"
										           }
										           id="create_offer.sell_input_margin_extra"
										           values={{
											           price       : <b>{currencyFormat((marketPricePercentage * marketPrice) / 100, currency)}</b>,
											           marketPrice : <b>{currencyFormat(marketPrice, currency)}</b>,
										           }}/>
								           </span>
							           )}

							           <Icon spin={marketPriceLoading}
							                 onClick={this.fetchMarketPrice}
							                 type="sync"/>
						           </span>
					           }>
						{getFieldDecorator('profit_margin', {
							initialValue : 5,
							rules        : [
								{type : 'number', required : true},
							],
						})(
							<InputNumber style={{width : '100%'}}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Min Amount"
							           id="create_offer.sell_input_min_amount_label"/>
					           }
					           wrapperCol={{xs : 16}}
					           labelCol={{xs : 8}}>
						{getFieldDecorator('min_amount', {
							rules : [
								{type : 'number', required : true},
							],
						})(
							<InputNumber min={1} style={{width : '100%'}}
							             parser={value => {
								             const parsed = parseFloat(value);
								             if (!isNaN(parsed)) return parsed;
							             }}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Max Amount"
							           id="create_offer.sell_input_max_amount_label"/>
					           }
					           wrapperCol={{xs : 16}}
					           labelCol={{xs : 8}}>
						{getFieldDecorator('max_amount', {
							rules : [
								{type : 'number', required : true},
							],
						})(
							<InputNumber min={1} style={{width : '100%'}}
							             parser={value => {
								             const parsed = parseFloat(value);
								             if (!isNaN(parsed)) return parsed;
							             }}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Time Frame"
							           id="create_offer.sell_input_confirmation_time_frame_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "Indicates the amount of time in {minutes} your buyer has to make their payment. " +
								           "The trade will automatically be canceled if the buyer has not clicked {confirmed} " +
								           "before the payment window expires."
							           }
							           id="create_offer.sell_input_confirmation_time_frame_extra"
							           values={{
								           confirmed : (
									           <b>
										           <FormattedMessage
											           defaultMessage="Mark as Paid"
											           id="common.sell_mark_as_paid"/>
									           </b>
								           ),
								           minutes   : <b>minutes</b>,
							           }}/>
					           }
					           wrapperCol={{xs : 16}}
					           labelCol={{xs : 8}}>
						{getFieldDecorator('confirmation_time_frame', {
							rules : [
								{type : 'number', required : true, min : 30, max : 4350},
							],
						})(
							<InputNumber min={1} step={1} style={{width : '100%'}}/>
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
									"Buyers often look for the best value and great vendor ratings. " +
									"Choose a margin that you think your target buyers will find attractive. " +
									"Here, you can set your exact offers limits, and advanced options."
								}
								id="create_offer.sell_margin_information"/>
						</p>
						<div>
							{(maximumAmount || minimumAmount) && (
								<Alert type="warning"
								       message={
									       <div>
										       <span>
											       <FormattedMessage
												       defaultMessage={
													       "Your offer will not be shown to the public unless you comply with the following:"
												       }
												       id="create_offer.sell_offer_visibility_info"/>
										       </span>

										       <ul className="mt-2 pl-3">
											       {maximumAmount && (
												       <li>
													       <FormattedMessage
														       defaultMessage={
															       "Your wallet account has at least {maximum} available, which is the maximum amount of your offer!"
														       }
														       id="create_offer.sell_offer_visibility_max_amount_requirement"
														       values={{
															       maximum : <b>{maximumAmount}</b>
														       }}/>
												       </li>
											       )}

											       {!maximumAmount && minimumAmount && (
												       <li>
													       <FormattedMessage
														       defaultMessage={
															       "Your wallet account has at least {minimum} available, which is the minimum amount of your offer!"
														       }
														       id="create_offer.sell_offer_visibility_min_amount_requirement"
														       values={{
															       minimum : <b>{minimumAmount}</b>
														       }}/>
												       </li>
											       )}
										       </ul>
									       </div>
								       }
								       showIcon/>
							)}
						</div>

						<div className="mt-4">
							<OfferInformation
								marketplaceFee={marketplaceFee}
								form={form} paymentMethod={paymentMethod}
								walletAccount={walletAccount}/>
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
		mapStateToProps,
		null, null,
		{forwardRef : true}
	)
)(ProfitMargin);