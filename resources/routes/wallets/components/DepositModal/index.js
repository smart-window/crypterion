import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Alert, Icon, Modal, Result, Spin, Typography} from "antd";
import {pipe} from "support/utils/common";
import {hideDepositModal, showDepositModal} from "redux/actions/Wallet";
import {connect} from "react-redux";
import {find} from "lodash";
import {handleError, handleSuccess} from "support/utils/promise";
import ApiService from "support/Services/Api";
import QRCode from "qrcode.react"
import context from "context";

const {colorPalettes} = context.settings;
const {Paragraph} = Typography;

class DepositModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading        : false,
			confirmLoading : false,
			address        : ""
		};

		this.api = new ApiService();
	}

	hideModal = () => {
		this.props.hideDepositModal();
	};

	getAccount() {
		const {accounts, accountId} = this.props;
		return find(accounts, {id : accountId})
	}

	componentDidMount() {
		this.getLatestAddress();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.accountId !== this.props.accountId) {
			console.log('Updated DepositModal Component');
			this.getLatestAddress();
		}
	}

	generateAddress = () => {
		const {accountId} = this.props;
		if (!accountId) return;
		const {axios, route} = this.api;

		const endpoint = route('user.wallet-account.generate-address', {
			walletAccount : accountId
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					address        : data.address,
					confirmLoading : false
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({confirmLoading : false});
			}));

		this.setState({confirmLoading : true});

	};

	componentWillUnmount() {
		this.api.cancel()
	}

	getLatestAddress() {
		const {accountId} = this.props;
		if (!accountId) return;
		const {axios, route} = this.api;

		const endpoint = route('user.wallet-account.latest-address', {
			walletAccount : accountId
		});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					address : data.address,
					loading : false
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));

		this.setState({loading : true, address : ""});
	}

	render() {
		const {visible} = this.props;
		const account = this.getAccount();

		return (
			<div>
				<Modal visible={visible}
				       title={

					       <FormattedMessage
						       defaultMessage="Deposit {coin}"
						       id="wallet.deposit_modal_title"
						       values={{
							       coin : <b>{account ? account.wallet.coin.name : "Coin"}</b>
						       }}/>
				       }
				       confirmLoading={this.state.confirmLoading}
				       onCancel={this.hideModal}
				       onOk={this.generateAddress}
				       okButtonProps={{disabled : !account}}
				       okText={
					       <span>
						       <FormattedMessage
							       defaultMessage="Generate New Address"
							       id="wallet.deposit_modal_ok"/>
					       </span>
				       }>
					<Spin spinning={this.state.loading}>
						{account && this.state.address ?
							<React.Fragment>
								<Alert className="mb-1"
								       showIcon
								       type="info"
								       message={
									       <FormattedMessage
										       id="wallet.deposit_confirmation_info"
										       defaultMessage={
											       "Depositing to the below address requires confirmations of the " +
											       "entire network. It will arrive after {confirmations} confirmations."
										       }
										       values={{
											       confirmations : <b>{account.wallet.min_confirmations}</b>
										       }}/>
								       }/>
								<div className="text-center my-3">
									<QRCode value={this.state.address}
									        size={150}
									        className="img-thumbnail"/>
								</div>
								<Paragraph copyable
								           className="text-center my-3 cp-fs-lg">
									{this.state.address}
								</Paragraph>

								<Alert className="mb-1"
								       showIcon
								       type="warning"
								       message={
									       <FormattedMessage
										       defaultMessage={
											       "Receiving on multiple addresses will cause higher transaction " +
											       "fee on your next external transfer. You should only generate new address " +
											       "when you are receiving significant funds on it."
										       }
										       id="wallet.generate_new_address_warning"/>
								       }/>
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
					</Spin>
				</Modal>
			</div>
		);
	}
}

const mapStateToProps = ({
	wallet : {
		accounts,
		visibleDepositModal,
		depositAccountId
	}
}) => ({
	accounts,
	visible   : visibleDepositModal,
	accountId : depositAccountId
});

export default pipe(
	connect(
		mapStateToProps,
		{
			showDepositModal,
			hideDepositModal
		}
	)
)(DepositModal);