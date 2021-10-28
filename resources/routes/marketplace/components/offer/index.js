import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe, utcDateCalendarTime} from "support/utils/common";
import {connect} from "react-redux";
import {Alert, Button, Col, Divider, Form, Rate, Row} from "antd";
import Widget from "components/Widget";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "support/utils/promise";
import {isEmpty} from "lodash";
import Loading from "components/Loading";
import PageNotFound from "components/PageNotFound";
import ApiService from "support/Services/Api";
import UserAvatar from "components/UserAvatar";
import millify from "millify";
import Flag from "components/Flag";
import {generatePath, Link} from "react-router-dom";
import {defineMessages, FormattedMessage} from "react-intl";
import MarketplaceReviews from "components/MarketplaceReviews";
import AmountInput from "./components/AmountInput";
import formHelper from "support/Helpers/Form";
import menuItemLinks from "containers/utils/menuItemLinks";
import context from "context";
import {Helmet} from "react-helmet";

const messages = defineMessages({
	successful : {
		defaultMessage : "Trade started successfully!",
		id             : "offer.start_trade_action_successful"
	},
	pageTitle  : {
		defaultMessage : "{title} | {name}",
		id             : "meta.title.marketplace_offer"
	},
});

class Offer extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			offer          : {},
			confirmLoading : false,
			loading        : false
		}
	}

	componentDidMount() {
		this.fetchOffer();
	}

	shouldVerifyEmail() {
		const {offer} = this.state;
		const {auth} = this.props;

		return offer.require_email_verification &&
			!auth.verifiedEmail();
	}

	shouldVerifyPhone() {
		const {offer} = this.state;
		const {auth} = this.props;

		return offer.require_phone_verification &&
			!auth.verifiedPhone();
	}

	canStartTrade() {
		const {auth} = this.props;
		const {offer} = this.state;

		return offer.visibility && (
			auth.check() && (
				auth.user.id !== offer.user.id && (
					!this.shouldVerifyEmail() &&
					!this.shouldVerifyPhone()
				)
			)
		);
	}

	goToChat = (chatId) => {
		const {history} = this.props;

		const path = generatePath(menuItemLinks['chat.view'].path, {
			token : chatId
		});

		if (!isEmpty(history)) {
			return history.push(path);
		}
	};

	handleSubmit = (e) => {
		e.preventDefault();
		const {axios, route} = this.api;
		const {loading, offer} = this.state;
		const {form, intl} = this.props;

		if (loading || !this.canStartTrade()) return;

		const endpoint = route('marketplace.offer.start-trade', {
			offer : offer.slug
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.goToChat(data.chat_id);
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		const matchParams = this.props.match.params;
		const prevMatchParams = prevProps.match.params;

		if (matchParams.slug !== prevMatchParams.slug) {
			this.fetchOffer();
			console.log('Updated Offer Component');
		}
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	fetchOffer = () => {
		const {axios, route} = this.api;
		const {match} = this.props;
		this.setState({loading : true});

		const endpoint = route('marketplace.offer.get', {
			offer : match.params.slug
		}).url();

		axios.get(endpoint)
			.then(response => handleSuccess(response, (data) => {
				this.setState({offer : data, loading : false});
			}))
			.catch(error => handleError(error, () => {
				this.setState({offer : {}, loading : false});
			}))
	};


	getSharableLink = () => {
		if (typeof window !== "undefined") {
			return window.location.href;
		}
	};

	getPageTitle() {
		const {intl} = this.props;
		const {offer} = this.state;

		return intl.formatMessage(messages.pageTitle, {
			name  : context.name,
			title : offer.title
		})
	}

	render() {
		const {auth} = this.props;
		const {getFieldDecorator} = this.props.form;
		const {
			loading, offer, confirmLoading
		} = this.state;

		const sharableLink = this.getSharableLink();

		return !isEmpty(offer) ? (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<Row gutter={8}>
					<Col xl={16} lg={14} md={14}>
						<Widget>
							<h2 className="text-uppercase">
								{offer.type === "sell" && (
									<FormattedMessage
										defaultMessage="How much do you want to buy?"
										id="offer.how_much_buy"/>
								)}

								{offer.type === "buy" && (
									<FormattedMessage
										defaultMessage="How much do you want to sell?"
										id="offer.how_much_sell"/>
								)}
							</h2>

							<Form className="mt-3" onSubmit={this.handleSubmit}>
								<Form.Item labelAlign="left"
								           label={
									           <FormattedMessage
										           defaultMessage="Enter Amount"
										           id="offer.enter_amount"/>
								           }>
									{getFieldDecorator('amount', {
										rules : [
											{
												type     : 'number',
												required : true,
												min      : offer.min_amount,
												max      : offer.real_max_amount
											}
										],
									})(
										<AmountInput
											currency={offer.currency}
											precision={offer.coin_precision}
											coinSymbol={offer.coin_symbol}
											unitPrice={offer.rate}/>
									)}
								</Form.Item>

								{!offer.visibility ? (
									<Alert className="mb-1"
									       type="warning"
									       message={
										       <FormattedMessage
											       id="offer.unavailable_info"
											       defaultMessage={
												       "This offer is {unavailable}. This can be because the owner has " +
												       "disable the offer, cannot currently interact with the platform, " +
												       "or they do not have enough balance to fulfill the offer."
											       }
											       values={{
												       unavailable : (
													       <span className="text-uppercase font-weight-bold">
														       <FormattedMessage
															       defaultMessage="Unavailable"
															       id="common.unavailable"/>
													       </span>
												       )
											       }}/>
									       }
									       showIcon/>
								) : !this.canStartTrade() && (
									<div className="my-2">
										<Alert
											message={
												<FormattedMessage
													defaultMessage="Unable to Start Trade"
													id="offer.unable_to_start_trade"/>
											}
											description={
												<ol className="mt-1 pl-3 mb-0">
													{!auth.check() ? (
														<li>
															<FormattedMessage
																id="offer.authentication_required_desc"
																defaultMessage={
																	"You need to {register} or {login} to continue with the trade."
																}
																values={{
																	register : (
																		<b>
																			<FormattedMessage
																				defaultMessage="Register"
																				id="common.register"/>
																		</b>
																	),
																	login    : (
																		<b>
																			<FormattedMessage
																				defaultMessage="Login"
																				id="common.login"/>
																		</b>
																	)
																}}/>
														</li>
													) : (
														<React.Fragment>
															{(auth.user.id === offer.user.id) ? (
																<li>
																	<FormattedMessage
																		defaultMessage={
																			"You cannot start a trade with yourself!"
																		}
																		id="offer.cannot_start_trade_with_self_desc"/>
																</li>
															) : (
																<React.Fragment>
																	{this.shouldVerifyPhone() && (
																		<li>
																			<FormattedMessage
																				defaultMessage="{phone} verification is required by the owner"
																				id="offer.phone_verification_required_desc"
																				values={{
																					phone : (
																						<b>
																							<FormattedMessage
																								defaultMessage="Phone"
																								id="common.phone"/>
																						</b>
																					)
																				}}/>
																		</li>
																	)}

																	{this.shouldVerifyEmail() && (
																		<li>
																			<FormattedMessage
																				defaultMessage="{email} verification is required by the owner"
																				id="offer.email_verification_required_desc"
																				values={{
																					email : (
																						<b>
																							<FormattedMessage
																								defaultMessage="Email"
																								id="common.email"/>
																						</b>
																					)
																				}}/>
																		</li>
																	)}
																</React.Fragment>
															)}
														</React.Fragment>
													)}
												</ol>
											}
											type="warning"
											showIcon/>
									</div>
								)}

								<Form.Item>
									<Button type="primary" size="large"
									        loading={confirmLoading} icon="lock"
									        disabled={!this.canStartTrade()}
									        htmlType="submit" block>
										<span className="text-uppercase">
											{offer.type === "sell" && (
												<FormattedMessage
													defaultMessage="Buy Now!"
													id="offer.buy_now"/>
											)}

											{offer.type === "buy" && (
												<FormattedMessage
													defaultMessage="Sell Now!"
													id="offer.sell_now"/>
											)}
										</span>
									</Button>
								</Form.Item>

								<Row gutter={8}>
									<Col sm={12} className="my-2">
										<Alert type="info"
										       message={
											       <div>
												       <div className="font-weight-medium">
													       <FormattedMessage
														       defaultMessage="Offer Information"
														       id="offer.offer_information"/>
												       </div>
												       <ol className="mt-1 pl-3 mb-0">
													       <li>
														       <FormattedMessage
															       defaultMessage={
																       "Your amount should be between {minimum} and {maximum}!"
															       }
															       id="offer.amount_range_information"
															       values={{
																       maximum :
																	       <b>{offer.formatted_real_max_amount}</b>,
																       minimum :
																	       <b>{offer.formatted_min_amount}</b>,
															       }}/>
													       </li>
													       <li>
														       <FormattedMessage
															       defaultMessage={
																       "Rate per {coin_name} is {price}. You can buy any fraction"
															       }
															       id="offer.rate_information"
															       values={{
																       coin_name : <b>{offer.coin_name}</b>,
																       price     : <b>{offer.formatted_rate}</b>,
															       }}/>
													       </li>
												       </ol>
											       </div>
										       }/>
									</Col>
									<Col sm={12} className="my-2">
										<Alert type="warning"
										       message={
											       <div>
												       <div className="font-weight-medium">
													       <FormattedMessage
														       defaultMessage="Payment Verification"
														       id="offer.payment_verification_warning"/>
												       </div>
												       <div className="mt-1">
													       <FormattedMessage
														       defaultMessage={
															       "The buyer of this trade has a time limit of {deadline} to pay " +
															       "for the trade before the trade is cancelled by the system. " +
															       "Trade will not auto-cancel when buyer has marked trade as paid, " +
															       "after which buyer has to wait for seller to release coin."
														       }
														       id="offer.confirmation_time_information"
														       values={{
															       deadline :
																       <b>{offer.confirmation_time_frame} minutes</b>,
														       }}/>
												       </div>
											       </div>
										       }/>
									</Col>
								</Row>
							</Form>

							<Divider>
								<FormattedMessage
									defaultMessage="Owner Terms"
									id="offer.owner_terms"/>
							</Divider>

							<p style={{whiteSpace : 'pre-line'}}
							   className="font-italic cp-fs-lg">
								{offer.terms}
							</p>
						</Widget>
					</Col>
					<Col xl={8} lg={10} md={10}>
						<Widget
							actions={sharableLink && [
								<a href={`//twitter.com/intent/tweet?url=${sharableLink}`}>
									<i className="lab la-twitter cp-fs-2x"/>
								</a>,
								<a href={`//reddit.com/submit?url=${sharableLink}`}>
									<i className="lab la-reddit cp-fs-2x"/>
								</a>,
								<a href={`//www.facebook.com/sharer.php?u=${sharableLink}`}>
									<i className="lab la-facebook cp-fs-2x"/>
								</a>
							]}>

							<div className="text-center mb-3">
								<UserAvatar
									user={offer.user}
									className="cp-fs-3x"
									size={150}/>
							</div>

							<h2 className="mt-2 mb-1 cp-fs-xxl font-weight-light text-center">
								<span className="mr-2">
									<Link to={`/profile/${offer.user.name}`}>
										{offer.user.name}
									</Link>
								</span>

								{offer.user.location && (
									<Flag code={offer.user.location.iso_code}/>
								)}
							</h2>

							<div className="cp-fs-lg text-center">
								<Rate value={offer.user.average_marketplace_rating} disabled/>

								<span className={"ml-2"}>
									({millify(offer.user.total_marketplace_rating)})
								</span>
							</div>

							{offer.user.last_seen_at && (
								<div className="mt-2 align-items-center d-flex justify-content-center">
									<i className="la la-clock cp-fs-xl"/>

									<span className="ml-2">
										{utcDateCalendarTime(offer.user.last_seen_at)}
									</span>
								</div>
							)}

						</Widget>

						<MarketplaceReviews user={offer.user}/>
					</Col>
				</Row>
			</React.Fragment>
		) : !loading ? (
			<PageNotFound/>
		) : (
			<Loading/>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
)(Offer);