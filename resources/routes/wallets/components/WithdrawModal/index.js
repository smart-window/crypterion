import React, {Component} from 'react';
import {hideWithdrawModal} from "redux/actions/Wallet";
import {pipe} from "support/utils/common";
import {Alert, Col, Divider, Form, Icon, Input, Modal, Result, Row} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import ApiService from "support/Services/Api";
import formHelper from "support/Helpers/Form";
import {find, isEmpty, round} from "lodash";
import AmountInput from "./components/AmountInput";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import Auth from "support/Auth";
import context from "context";

const {colorPalettes} = context.settings;

const messages = defineMessages({
	successful : {
		defaultMessage : "Transaction was sent successfully!",
		id             : "wallet.transaction_sent"
	},
});

class WithdrawModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			formattedFee   : null,
			fee            : 0,
			feeLoading     : false,
			confirmLoading : false,
		};

		this.api = new ApiService()
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	getAccount() {
		const {accounts, accountId} = this.props;
		return find(accounts, {id : accountId})
	}

	calcTotal() {
		const account = this.getAccount();
		if (!account) return null;

		const {getFieldValue} = this.props.form;
		const {fee} = this.state;
		const precision = account.wallet.coin.precision;
		const amount = getFieldValue('amount');
		if (typeof amount !== "number" || !amount) {
			return null
		}

		const total = !this.shouldChargeFee() ?
			amount : amount + fee;

		return round(total, precision);
	}

	shouldChargeFee() {
		const {getFieldValue} = this.props.form;
		const address = getFieldValue('address');
		return !/\S+@\S+\.\S+/.test(address);
	}

	getTransactionFee = () => {
		const account = this.getAccount();
		if (!account) return false;

		const {axios, route} = this.api;
		const {form} = this.props;
		const {getFieldsValue} = form;

		const endpoint = route('user.wallet-account.calc-fee', {
			walletAccount : account.id
		});

		const values = getFieldsValue(['amount']);

		axios.post(endpoint.url(), values)
			.then(response => handleFormSuccess(response, form, (data) => {
				this.setState({
					feeLoading   : false,
					fee          : data.fee,
					formattedFee : data.formatted_fee
				});
			}))
			.catch(error => handleFormError(error, form, values, () => {
				this.setState({feeLoading : false});
			}));

		this.setState({feeLoading : true});
	};

	canSubmit() {
		const total = this.calcTotal();
		const account = this.getAccount();
		if (!account) return false;

		return typeof total === "number" &&
			total && total > 0 &&
			total <= account.available;
	}

	hideModal = () => {
		this.props.hideWithdrawModal()
	};

	handleSubmit = (e) => {
		const account = this.getAccount();
		if (!account) return false;

		const {form, intl} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.wallet-account.send', {
			walletAccount : account.id
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.hideModal();
						this.triggerSuccess();
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess() {
		const {onSuccess} = this.props;
		if (typeof onSuccess === "function") {
			return onSuccess();
		}
	}

	render() {
		const {visible, form, auth} = this.props;
		const {getFieldDecorator} = form;
		const {confirmLoading, fee, formattedFee, feeLoading} = this.state;

		const account = this.getAccount();
		const total = this.calcTotal();

		const twoFactorSetting = auth.twoFactorSetting();

		return (
			<div>
				<Modal visible={visible}
				       confirmLoading={confirmLoading}
				       onCancel={this.hideModal}
				       okButtonProps={{disabled : !this.canSubmit()}}
				       onOk={this.handleSubmit}
				       destroyOnClose={true}
				       okText={
					       <span>
						       <FormattedMessage
							       defaultMessage="Confirm"
							       id="common.confirm"/>
					       </span>
				       }
				       title={
					       <FormattedMessage
						       defaultMessage="Withdraw {coin}"
						       id="wallet.withdraw_modal_title"
						       values={{
							       coin : <b>{account ? account.wallet.coin.name : "Coin"}</b>
						       }}/>
				       }>
					{account ?
						<React.Fragment>
							<Alert showIcon
							       message={
								       <FormattedMessage
									       defaultMessage={
										       "Please make sure you check the withdraw address information carefully " +
										       "before the withdraw operation. You can use email address for internal " +
										       "transfer to avoid transaction fee."
									       }
									       id="wallet.withdrawal_info"/>
							       }
							       type="info"/>
							<Form className="mt-3"
							      wrapperCol={{xs : 24, sm : 16}}
							      labelCol={{xs : 24, sm : 8}}>
								<Form.Item labelAlign="left"
								           label={
									           <FormattedMessage
										           defaultMessage="Address"
										           id="common.address_or_email"/>
								           }>
									{getFieldDecorator('address', {
										rules : [{required : true}],
									})(<Input/>)}
								</Form.Item>

								<Form.Item labelAlign="left"
								           label={
									           <FormattedMessage
										           defaultMessage="Amount"
										           id="common.amount"/>
								           }>
									{getFieldDecorator('amount', {
										rules : [
											{
												type     : 'number',
												required : true,
												min      : account.min_transferable,
												max      : account.max_transferable
											}
										],
									})(
										<AmountInput
											currency={account.user.currency}
											coinSymbol={account.wallet.coin.symbol}
											precision={account.wallet.coin.precision}
											unitPrice={account.price}/>
									)}
								</Form.Item>

								{this.shouldChargeFee() && (
									<Row className="d-flex align-items-center mb-2"
									     gutter={8}>
										<Col className="px-3"
										     span={8}>
											<strong>
												<FormattedMessage
													defaultMessage="Fee"
													id="wallet.fee"/>
											</strong>
										</Col>

										<Col span={16}>
											{fee > 0 && (
												<React.Fragment>
													<span className="mr-1">
														{fee}
													</span>
													<span className="mr-1">
														({formattedFee})
													</span>
												</React.Fragment>
											)}

											<Icon spin={feeLoading}
											      onClick={this.getTransactionFee}
											      type="sync"/>
										</Col>
									</Row>
								)}

								{total && (
									<Row className="d-flex align-items-center mb-2"
									     gutter={8}>
										<Col className="px-3"
										     span={8}>
											<strong>
												<FormattedMessage
													defaultMessage="Total"
													id="common.total"/>
											</strong>
										</Col>

										<Col span={16}>
											{total}
										</Col>
									</Row>
								)}

								<Row className="d-flex align-items-center mb-2"
								     gutter={8}>
									<Col className="px-3"
									     span={8}>
										<strong>
											<FormattedMessage
												defaultMessage="Available"
												id="common.available"/>
										</strong>
									</Col>

									<Col span={16}>
										<span className={`${this.canSubmit() && 'cp-text-success'}`}>
											<span className="mr-1">
												{account.available}
											</span>
											<span>
												({account.formatted_available_price})
											</span>
										</span>
									</Col>
								</Row>

								<Divider>
									<FormattedMessage
										defaultMessage="Verify Identity"
										id="wallet.verify_identity"/>
								</Divider>

								{twoFactorSetting.outgoingTransfer() ? (
									<Form.Item labelAlign="left"
									           label={
										           <FormattedMessage
											           defaultMessage="Token"
											           id="common.token"/>
									           }>
										{getFieldDecorator('token', {
											rules : [{required : true}],
										})(<Input/>)}
									</Form.Item>
								) : (
									<React.Fragment>
										<Alert showIcon
										       className="mb-3"
										       message={
											       <FormattedMessage
												       defaultMessage={
													       "You should setup two factor authentication to add an extra layer of security."
												       }
												       id="wallet.validate_identity"/>
										       }
										       type="error"/>

										<Form.Item labelAlign="left"
										           label={
											           <FormattedMessage
												           defaultMessage="Password"
												           id="common.password"/>
										           }>
											{getFieldDecorator('password', {
												rules : [{required : true}],
											})(
												<Input.Password prefix={<Icon type="lock"/>}
												                autoComplete="off"/>
											)}
										</Form.Item>
									</React.Fragment>
								)}
							</Form>
						</React.Fragment> :
						<Result
							icon={
								<Icon type="frown"
								      twoToneColor={colorPalettes['@primary-color']}
								      theme="twoTone"/>
							}
							extra={
								<span className="text-muted">
									<FormattedMessage
										defaultMessage="Account not found."
										id="wallet.account_not_found"/>
								</span>
							}
							status="info"/>
					}
				</Modal>
			</div>
		);
	}
}


const mapStateToProps = ({
	wallet : {
		withdrawAccountId,
		visibleWithdrawModal,
		accounts,
	},
	auth
}) => ({
	accountId : withdrawAccountId,
	visible   : visibleWithdrawModal,
	accounts,
	auth      : new Auth(auth),
});

export default pipe(
	connect(
		mapStateToProps,
		{
			hideWithdrawModal
		}
	),
	formHelper(),
)(WithdrawModal);