import React, {Component} from 'react';
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import {Button, Form, Icon, Steps} from "antd";
import formHelper from "support/Helpers/Form";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import ApiService from "support/Services/Api";
import {assign, concat, find, intersection, isEmpty, keys, mapValues, pick} from "lodash"
import PaymentSetup from "./components/PaymentSetup";
import ProfitMargin from "./components/ProfitMargin";
import TermsOfTrade from "./components/TermsOfTrade";
import {LAYOUT_TYPE_FRAMED} from "constants/ThemeSettings";
import {generatePath, withRouter} from "react-router-dom";
import menuItemLinks from "containers/utils/menuItemLinks";

const {Step} = Steps;

const messages = defineMessages({
	createdSuccessful : {
		defaultMessage : "Offer created successfully!.",
		id             : "create_offer.offer_created"
	},
	updatedSuccessful : {
		defaultMessage : "Offer updated successfully!.",
		id             : "create_offer.offer_updated"
	},
});

class CreateBuyOffer extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			current        : 0,
			confirmLoading : false
		};

		this.paymentSetupFields = [
			'wallet_account',
			'payment_method',
			'currency'
		];

		this.profitMarginFields = [
			'profit_margin',
			'min_amount',
			'max_amount',
			'confirmation_time_frame',
		];

		this.termsOfTradeFields = [
			'terms',
			'instructions',
			'label',
			'tags',
			'privacy',
			'require_phone_verification',
			'require_email_verification',
		];
	}

	componentDidMount() {
		this.setOfferFields();
	}

	setOfferFields() {
		const {offer, form} = this.props;

		if (isEmpty(offer)) return;

		const values = pick(offer, concat(
			this.paymentSetupFields,
			this.profitMarginFields,
			this.termsOfTradeFields
		));

		const fields = mapValues(values,
			(v) => {
				return typeof v === "object" &&
				v !== null && !Array.isArray(v) ?
					(v.id || null) : v;
			});

		form.setFieldsValue(fields);
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	getMarketPlaceFee() {
		const {accounts, form, paymentMethods} = this.props;

		const walletAccountId = form.getFieldValue('wallet_account');
		if (walletAccountId) {
			this.walletAccount = find(accounts, {id : walletAccountId});
		}
		const paymentMethodId = form.getFieldValue('payment_method');
		if (paymentMethodId) {
			this.paymentMethod = find(paymentMethods, {id : paymentMethodId});
		}

		if (!this.walletAccount || !this.paymentMethod) return;
		const wallet = this.walletAccount.wallet;

		const walletFees = this.paymentMethod.wallet_fees;
		const walletFee = find(walletFees, {wallet_id : wallet.id});

		if (walletFee) {
			return walletFee.marketplace_fee || wallet.marketplace_fee;
		} else {
			return wallet.marketplace_fee;
		}
	}

	handleErrors(errors) {
		const errorFields = keys(errors);

		const paymentSetupErrorFields = intersection(errorFields, this.paymentSetupFields);
		const profitMarginErrorFields = intersection(errorFields, this.profitMarginFields);

		if (paymentSetupErrorFields.length > 0) {
			this.setState({current : 0}, () => {
				this.scrollToTop();
			});

		} else if (profitMarginErrorFields.length > 0) {
			this.setState({current : 1}, () => {
				this.scrollToTop();
			});
		} else {
			this.setState({current : 2}, () => {
				this.scrollToTop();
			});
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, history, offer} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('marketplace.create-offer.buy');

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				if (offer && offer.id) {
					values = assign({}, values, {id : offer.id})
				}
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
							this.setState({confirmLoading : false});
							const path = generatePath(menuItemLinks['marketplace.offer'].path, {
								slug : data.slug
							});
							if (!isEmpty(history)) history.replace(path);
						}, (offer && offer.id) ?
						intl.formatMessage(messages.updatedSuccessful) :
						intl.formatMessage(messages.createdSuccessful)
					))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
						if (error.response && error.response.data) {
							const {errors} = error.response.data;
							if (!isEmpty(errors)) this.handleErrors(errors);
						}
					}));
				this.setState({confirmLoading : true});
			} else {
				this.handleErrors(errors)
			}
		})
	};

	next() {
		const {current} = this.state;
		const {form} = this.props;

		if (current === 0) {
			form.validateFields(this.paymentSetupFields, (errors) => {
				if (isEmpty(errors)) {
					this.setState({current : 1}, () => {
						this.scrollToTop();
						this.profitMarginRef.fetchMarketPrice();
					});
				}
			});
		}

		if (current === 1) {
			form.validateFields(this.profitMarginFields, (errors) => {
				if (isEmpty(errors)) {
					this.setState({current : 2}, () => {
						this.scrollToTop();
					});
				}
			});
		}
	}

	scrollToTop = () => {
		const {layoutType} = this.props;

		if (layoutType === LAYOUT_TYPE_FRAMED) {
			if (typeof document !== "undefined") {

				const root = document.getElementById('root');

				if (root) {
					root.scrollTo({
						top      : 0,
						behavior : 'smooth',
					})
				}
			}
		} else {
			if (typeof window !== "undefined") {
				window.scrollTo({
					top      : 0,
					behavior : 'smooth',
				})
			}
		}
	};

	prev() {
		const {current} = this.state;
		this.setState({current : current - 1}, () => {
			this.scrollToTop();
		});
	}

	render() {
		const marketplaceFee = this.getMarketPlaceFee();
		const {intl, form, offer, paymentMethods, marketplaceTags} = this.props;
		const {current, confirmLoading} = this.state;

		return (
			<div>
				<Widget
					title={offer && offer.id ? (
						<FormattedMessage
							defaultMessage="Edit Buy Offer"
							id="marketplace.edit_buy_offer"/>
					) : (
						<FormattedMessage
							defaultMessage="Create Buy Offer"
							id="marketplace.create_buy_offer"/>
					)}>

					<div className="mb-5 d-none d-sm-flex">
						<Steps current={current}>
							<Step
								title={
									<FormattedMessage
										defaultMessage="Payment Setup"
										id="create_offer.buy_payment_setup"/>
								}
								description={
									<FormattedMessage
										defaultMessage="Choose currency."
										id="create_offer.buy_payment_setup_desc"/>
								}/>

							<Step
								title={
									<FormattedMessage
										defaultMessage="Profit Margin"
										id="create_offer.buy_profit_margin"/>
								}
								description={
									<FormattedMessage
										defaultMessage="Set trade limits."
										id="create_offer.buy_profit_margin_desc"/>
								}/>

							<Step
								title={
									<FormattedMessage
										defaultMessage="Terms of Trade"
										id="create_offer.buy_terms_of_trade"/>
								}
								description={
									<FormattedMessage
										defaultMessage="State your terms."
										id="create_offer.buy_terms_of_trade_desc"/>
								}/>

						</Steps>
					</div>

					<div className="mt-3">
						<Form onSubmit={this.handleSubmit}>
							<PaymentSetup intl={intl} form={form}
							              marketplaceFee={marketplaceFee}
							              paymentMethod={this.paymentMethod}
							              walletAccount={this.walletAccount}
							              paymentMethods={paymentMethods}
							              visible={current === 0}/>

							<ProfitMargin intl={intl} form={form}
							              paymentMethod={this.paymentMethod}
							              walletAccount={this.walletAccount}
							              marketplaceFee={marketplaceFee}
							              ref={(ref) => this.profitMarginRef = ref}
							              visible={current === 1}/>

							<TermsOfTrade intl={intl} form={form}
							              tags={marketplaceTags}
							              paymentMethod={this.paymentMethod}
							              walletAccount={this.walletAccount}
							              marketplaceFee={marketplaceFee}
							              visible={current === 2}/>

							<Form.Item className="mt-4"
							           wrapperCol={{xl : {offset : 16}}}>
								<div className="px-xl-3">
									{current > 0 && (
										<Button onClick={() => this.prev()}
										        type="default">
											<Icon type="double-left"/>
											<span>
												<FormattedMessage
													defaultMessage="Previous"
													id="common.buy_previous"/>
											</span>
										</Button>
									)}
									{current < 2 && (
										<Button className="cp-btn-primary"
										        onClick={() => this.next()}
										        type="default">
											<span>
												<FormattedMessage
													defaultMessage="Next"
													id="common.buy_next"/>
											</span>
											<Icon type="double-right"/>
										</Button>
									)}
									{current === 2 && (
										<Button type="default"
										        loading={confirmLoading}
										        icon={'save'}
										        className="cp-btn-success"
										        htmlType="submit">
											<span>
												{offer && offer.id ? (
													<FormattedMessage
														defaultMessage="Edit Offer"
														id="common.buy_edit_offer"/>
												) : (
													<FormattedMessage
														defaultMessage="Create Offer"
														id="common.buy_create_offer"/>
												)}
											</span>
										</Button>
									)}
								</div>
							</Form.Item>
						</Form>
					</div>

				</Widget>
			</div>
		);
	}
}


const mapStateToProps = ({
	settings    : {
		layoutType
	},
	collections : {
		marketplaceTags,
		currencies,
		paymentMethods
	},
	wallet      : {
		accounts
	},
}) => ({
	layoutType,
	accounts,
	marketplaceTags,
	currencies,
	paymentMethods
});

export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
	withRouter
)(CreateBuyOffer);