import React, {Component} from 'react';
import {Button, Col, Divider, Icon, Modal, Popover, Row, Spin, Statistic, Tag} from "antd";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {isEmpty, upperFirst} from "lodash";
import PriceCard from "./components/PriceCard";
import moment from "moment";
import ConfirmAction from "components/ConfirmAction";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import VerificationForm from "./components/VerificationForm";

const {Countdown} = Statistic;

const messages = defineMessages({
	approved : {
		defaultMessage : "Trade has been approved.",
		id             : "chats.marketplace_approved_successful"
	},

	disputed : {
		defaultMessage : "A moderator will be in touch soon.",
		id             : "chats.marketplace_disputed_successful"
	},

	cancelled : {
		defaultMessage : "Trade has been cancelled.",
		id             : "chats.marketplace_cancelled_successful"
	},

	confirmed : {
		defaultMessage : "Trade has been marked as paid.",
		id             : "chats.marketplace_confirmed_successful"
	},
});

class MarketplaceTrade extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			showVerificationForm : false,
			loading              : false,
		}
	}

	onFinishCountDown = () => {
		this.update();
	};

	showInstructions = (trade) => {
		Modal.info({
			content : (
				<p style={{whiteSpace : 'pre-line'}}>
					{trade.instructions}
				</p>
			)
		});
	};

	showTerms = (trade) => {
		Modal.info({
			content : (
				<p style={{whiteSpace : 'pre-line'}}>
					{trade.terms}
				</p>
			)
		});
	};

	update = () => {
		const {onUpdate} = this.props;
		if (typeof onUpdate === "function") {
			return onUpdate()
		}
	};

	canApproveTrade = (trade) => {
		const {auth} = this.props;
		if (!trade.confirmed_at) return false;

		return this.isOnGoing(trade) && (
			auth.user.id === trade.seller.id ||
			this.userCanManageTrade(trade)
		);
	};

	userCanManageTrade(trade) {
		const {auth} = this.props;
		return auth.can('manage_marketplace') &&
			!this.userIsPartOfTrade(trade)
	}

	approve = (trade, code) => {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('chats.marketplace.approve', {
			trade : trade.id
		});

		this.setState({loading : true});

		axios.post(endpoint.url(), {code})
			.then(response => handleSuccess(response, () => {
				this.setState({loading : false});
				this.update();
				this.toggleVerificationForm();
			}, intl.formatMessage(messages.approved)))

			.catch(error => handleError(error, () => {
				this.setState({loading : false})
			}));
	};

	isOnGoing = (trade) => {
		return !isEmpty(trade) && (
			trade.status === "active" ||
			trade.status === "dispute"
		);
	};

	canConfirmTrade = (trade) => {
		const {auth} = this.props;
		const deadline = moment.utc(trade.cancels_at);

		if (trade.confirmed_at) return false;
		if (moment().isAfter(deadline.local())) return false;
		if (trade.status !== 'active') return false;

		return auth.user.id === trade.buyer_id;
	};

	confirm = (trade) => {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('chats.marketplace.confirm', {
			trade : trade.id
		});
		this.setState({loading : true});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.setState({loading : false});
				this.update();
			}, intl.formatMessage(messages.confirmed)))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	};

	canCancelTrade = (trade) => {
		const {auth} = this.props;

		return this.isOnGoing(trade) && (
			this.userCanManageTrade(trade) ||
			auth.user.id === trade.buyer_id
		);
	};

	cancel = (trade) => {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('chats.marketplace.cancel', {
			trade : trade.id
		});
		this.setState({loading : true});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false});
				this.update();
			}, intl.formatMessage(messages.cancelled)))

			.catch(error => handleError(error, () => {
				this.setState({loading : false})
			}));

	};

	canDisputeTrade = (trade) => {
		if (!trade.confirmed_at) return false;
		if (trade.status !== 'active') return false;

		const confirmedAt = moment.utc(trade.confirmed_at);
		const createdAt = moment.utc(trade.created_at);
		const cancelsAt = moment.utc(trade.cancels_at);

		const disputableAfter = cancelsAt.diff(createdAt);
		const timeElapsed = moment().diff(confirmedAt.local());

		return timeElapsed > disputableAfter &&
			this.userIsPartOfTrade(trade);
	};

	userIsPartOfTrade(trade) {
		const {auth} = this.props;
		return (
			auth.user.id === trade.seller_id ||
			auth.user.id === trade.buyer_id
		)
	}

	dispute = (trade) => {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('chats.marketplace.dispute', {
			trade : trade.id
		});
		this.setState({loading : true});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false});
				this.update();
			}, intl.formatMessage(messages.disputed)))
			.catch(error => handleError(error, () => {
				this.setState({loading : false})
			}));

	};

	getStatusColor = (status) => {
		switch (status) {
			case 'successful':
				return "#52c41a";
			case 'active':
				return "#2db7f5";
			case 'dispute':
				return "#faad14";
			case "cancelled":
				return "#f5222d";
			default :
				return null;
		}
	};

	toggleVerificationForm = () => {
		this.setState(({showVerificationForm}) => {
			return {
				showVerificationForm : !showVerificationForm
			};
		})
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	render() {
		const {trade, auth} = this.props;
		if (isEmpty(trade) || !this.isOnGoing(trade)) return null;
		const {loading, showVerificationForm} = this.state;

		const twoFactorSetting = auth.twoFactorSetting();
		return (
			<Spin spinning={loading}>
				<div className="cp-trade pt-3" key={trade.id}>
					<h3 className="text-center">
						<span className="mr-2">
							<FormattedMessage
								defaultMessage="Trade Status"
								id="chats.trade_status"/>
						</span>
						<span>
							<Tag color={this.getStatusColor(trade.status)}>
								{upperFirst(trade.status)}
							</Tag>
						</span>
					</h3>

					<Divider/>

					<div className="px-1">
						<Row gutter={8}>
							<Col span={12}>
								<PriceCard
									price={trade.formatted_amount_price}
									styleName="mb-3"
									name={
										<FormattedMessage
											defaultMessage="Amount"
											id="common.amount"/>
									}/>
							</Col>

							<Col span={12}>
								<PriceCard
									price={trade.formatted_rate}
									styleName="mb-3"
									name={
										<FormattedMessage
											defaultMessage="Rate"
											id="common.rate"/>
									}/>
							</Col>
						</Row>

						<Row gutter={8}>
							<Col span={12}>
								<PriceCard
									price={trade.coin_name}
									name={
										<FormattedMessage
											defaultMessage="Coin"
											id="common.coin"/>
									}/>
							</Col>
							<Col span={12}>
								<PriceCard
									price={trade.formatted_fee_price}
									name={
										<FormattedMessage
											defaultMessage="Fee"
											id="common.fee"/>
									}/>
							</Col>
						</Row>
					</div>

					{!trade.confirmed_at && (
						<React.Fragment>
							<Divider/>

							<div className="text-center">
								<Countdown
									onFinish={this.onFinishCountDown}
									value={moment.utc(trade.cancels_at).local()}
									title={
										<FormattedMessage
											defaultMessage="Payment Deadline"
											id="common.payment_deadline"/>
									}/>
							</div>

							<Divider/>
						</React.Fragment>
					)}

					<div className="my-3 text-center w-100">
						{this.canApproveTrade(trade) && (
							<div>
								{showVerificationForm ? (
									<VerificationForm
										onSubmit={(code) => this.approve(trade, code)}
										onCancel={this.toggleVerificationForm}
										withTwoFactor={twoFactorSetting.marketplace()}/>
								) : (
									<Button type="default" shape="round"
									        onClick={this.toggleVerificationForm}
									        className="mx-0 mb-2 cp-btn-success"
									        icon="check-circle" size="small">
										<span>
											<FormattedMessage
												defaultMessage="Release Coin"
												id="trade.release_coin"/>
										</span>
									</Button>
								)}
							</div>
						)}

						{this.canConfirmTrade(trade) && (
							<div>
								<ConfirmAction
									onConfirm={() => this.confirm(trade)}
									title={
										<FormattedMessage
											defaultMessage="Are you sure you want to {action}?"
											id="trade.mark_trade_as_paid_confirmation"
											values={{
												action : (
													<b>
														<FormattedMessage
															defaultMessage="Mark Trade as Paid"
															id="trade.mark_trade_as_paid"/>
													</b>
												)
											}}/>
									}>
									<Button type="default"
									        icon="check" size="small"
									        className="mx-0 mb-2"
									        shape="round">
										<span>
											<FormattedMessage
												defaultMessage="Mark Trade as Paid"
												id="trade.mark_trade_as_paid"/>
										</span>
									</Button>
								</ConfirmAction>
							</div>
						)}

						{this.canCancelTrade(trade) && (
							<div>
								<ConfirmAction
									onConfirm={() => this.cancel(trade)}
									title={
										<FormattedMessage
											defaultMessage="Are you sure you want to {action}?"
											id="offer.cancel_trade_confirmation"
											values={{
												action : (
													<b>
														<FormattedMessage
															defaultMessage="Cancel Trade"
															id="trade.cancel_trade"/>
													</b>
												)
											}}/>
									}>
									<Button type="default" shape="round"
									        className="cp-btn-danger mx-0 mb-2"
									        icon="close-circle" size="small">
										<span>
											<FormattedMessage
												defaultMessage="Cancel Trade"
												id="trade.cancel_trade"/>
										</span>
									</Button>
								</ConfirmAction>
							</div>
						)}


						{this.canDisputeTrade(trade) && (
							<div>
								<ConfirmAction
									onConfirm={() => this.dispute(trade)}
									title={
										<FormattedMessage
											defaultMessage="Are you sure you want to {action}?"
											id="offer.raise_dispute_confirmation"
											values={{
												action : (
													<b>
														<FormattedMessage
															defaultMessage="Raise Dispute"
															id="trade.raise_dispute"/>
													</b>
												)
											}}/>
									}>

									<Button type="default" shape="round"
									        className="cp-btn-warning mx-0 mb-2"
									        icon="flag" size="small">
										<span>
											<FormattedMessage
												defaultMessage="Raise Dispute"
												id="trade.raise_dispute"/>
										</span>
									</Button>
								</ConfirmAction>
							</div>
						)}
					</div>

					<Divider/>

					<div className="px-2 mb-3 text-center">
						<h5 className="mb-2">
							<a className="mr-2" onClick={() => this.showTerms(trade)}>
								<FormattedMessage
									defaultMessage="Terms"
									id="common.terms"/>
							</a>
							<span className="mr-2">
								<FormattedMessage
									defaultMessage="and"
									id="common.and"/>
							</span>
							<a className="mr-2" onClick={() => this.showInstructions(trade)}>
								<FormattedMessage
									defaultMessage="Instructions"
									id="common.instruction"/>
							</a>
						</h5>

						<h5 className="mb-2">
							<span className="mr-2">
								<FormattedMessage
									defaultMessage={
										"{buyer} to pay {offerAmount} to {seller}"
									}
									values={{
										seller      : <b>{trade.seller.name}</b>,
										offerAmount : <b>{trade.formatted_offer_amount}</b>,
										buyer       : <b>{trade.buyer.name}</b>,
									}}
									id="chats.trade_payment_instruction"/>
							</span>
						</h5>

						<h5>
							<span className="mr-2">
								{trade.payment_method_name}
							</span>
							{trade.payment_method_description && (
								<Popover overlayStyle={{maxWidth : 250}}
								         content={trade.payment_method_description}
								         title={
									         <FormattedMessage
										         id="common.payment_method_description"
										         defaultMessage="Description"/>
								         }
								         trigger="click">
									<Icon type="question-circle" theme="filled"/>
								</Popover>
							)}
						</h5>
					</div>

					<Divider/>
				</div>
			</Spin>
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
	injectIntl,
)(MarketplaceTrade);