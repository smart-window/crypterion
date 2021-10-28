import React, {Component} from 'react';
import {Alert, Button, Col, Row, Table, Tooltip} from "antd";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import Widget from "admin/components/Widget";
import {pipe} from "admin/support/utils/common";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import WidgetIconInfo from "admin/components/WidgetIconInfo";
import NewWalletModal from "./components/NewWalletModal";
import RelayTransactionModal from "./components/RelayTransactionModal";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.wallets.action_successful"
	},
});

class Overview extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			adapters                                 : [],
			wallets                                  : [],
			total_account_balance                    : 0,
			formatted_total_account_balance          : "",
			total_account_balance_on_trade           : 0,
			formatted_total_account_balance_on_trade : "",
			total_earnings                           : 0,
			formatted_total_earnings                 : "",
			newWallet                                : false,
			loading                                  : false,
		}
	}

	toggleNewWalletModal = () => {
		this.setState(({newWallet}) => {
			return {newWallet : !newWallet}
		})
	};

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.wallets.data');

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					adapters                                 : data.adapters || [],
					wallets                                  : data.wallets || [],
					total_account_balance                    : data.total_account_balance || 0,
					formatted_total_account_balance          : data.formatted_total_account_balance || "",
					total_account_balance_on_trade           : data.total_account_balance_on_trade || 0,
					formatted_total_account_balance_on_trade : data.formatted_total_account_balance_on_trade || "",
					total_earnings                           : data.total_earnings || 0,
					formatted_total_earnings                 : data.formatted_total_earnings || "",
					loading                                  : false
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));

		this.setState({loading : true});
	}

	delete(wallet) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.wallets.remove', {
			identifier : wallet.identifier
		});

		axios.delete(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	};

	resetWebhook(wallet) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.wallets.reset-webhook', {
			identifier : wallet.identifier
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	}

	columns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Name"
					id="admin.wallets.name"/>,
				dataIndex : 'name',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Identifier"
					id="admin.wallets.identifier"/>,
				dataIndex : 'identifier',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Symbol"
					id="admin.wallets.symbol"/>,
				dataIndex : 'symbol',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Total Accounts"
					id="admin.wallets.total_accounts"/>,
				dataIndex : 'accounts_count',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Total Balance"
					id="admin.wallets.total_balance"/>,
				key    : 'total_balance',
				render : (text, record) => (
					record.accounts_stats.total_balance
				),
			},
			{
				title     : <FormattedMessage
					defaultMessage="Min Confirmations"
					id="admin.wallets.min_confirmations"/>,
				dataIndex : 'min_confirmations',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Source ID"
					id="admin.wallets.source_id"/>,
				dataIndex : 'source_id',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="common.action"/>,
				key    : 'action',
				fixed  : 'right',
				render : (text, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						{!record.accounts_count ? (
							<Button className="m-0 mx-1" shape="circle"
							        onClick={() => this.delete(record)}
							        type="danger" icon="delete"/>
						) : (
							<React.Fragment>
								<Tooltip title="Relay Transaction">
									<Button className="m-0 mx-1" shape="circle"
									        onClick={() => this.relayTransactionModal.show(record.identifier)}
									        type="primary" icon="file-sync"/>
								</Tooltip>

								<Tooltip title="Reset Webhook">
									<Button className="m-0 mx-1" shape="circle"
									        onClick={() => this.resetWebhook(record)}
									        type="primary" icon="sync"/>
								</Tooltip>
							</React.Fragment>
						)}
					</div>
				),
			},
		];
	};

	handleNewWalletSuccess = () => {
		this.toggleNewWalletModal();
		this.fetchData();
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {
			loading, wallets, newWallet, adapters,
			formatted_total_account_balance,
			formatted_total_account_balance_on_trade,
			formatted_total_earnings
		} = this.state;

		return (
			<React.Fragment>
				{!loading && (
					<Row className="text-center">
						{formatted_total_account_balance && (
							<Col sm={12} md={6}>
								<WidgetIconInfo
									title={formatted_total_account_balance}
									iconClassName="la la-wallet"
									subTitle={
										<FormattedMessage
											defaultMessage="Balance"
											id="admin.wallets.balance"/>
									}/>
							</Col>
						)}

						{formatted_total_account_balance_on_trade && (
							<Col sm={12} md={6}>
								<WidgetIconInfo
									title={formatted_total_account_balance_on_trade}
									iconClassName="la la-balance-scale"
									subTitle={
										<FormattedMessage
											defaultMessage="Balance On Trade"
											id="admin.wallets.balance_on_trade"/>
									}/>
							</Col>
						)}

						<Col sm={12} md={6}>
							<WidgetIconInfo
								title={wallets.length}
								iconClassName="la la-money-bill-wave"
								subTitle={
									<FormattedMessage
										defaultMessage="Wallets"
										id="common.wallets"/>
								}/>
						</Col>

						{formatted_total_earnings && (
							<Col sm={12} md={6}>
								<WidgetIconInfo
									title={formatted_total_earnings}
									iconClassName="la  la-funnel-dollar"
									subTitle={
										<FormattedMessage
											defaultMessage="Earnings"
											id="admin.wallets.earnings"/>
									}/>
							</Col>
						)}
					</Row>
				)}

				<Widget styleName="cp-card-table"
				        extra={
					        <Button className="m-0" shape="circle"
					                onClick={this.toggleNewWalletModal}
					                type="primary" icon="plus"/>
				        }
				        title={
					        <FormattedMessage
						        defaultMessage="Wallets"
						        id="admin.wallets"/>
				        }>
					<NewWalletModal
						adapters={adapters}
						onSuccess={this.handleNewWalletSuccess}
						ref={(form) => this.newWalletForm = form}
						onCancel={this.toggleNewWalletModal}
						visible={newWallet}/>

					<RelayTransactionModal
						wrappedComponentRef={(modal) => this.relayTransactionModal = modal}/>

					<Table className="mt-1"
					       columns={this.columns()}
					       rowKey="identifier"
					       scroll={{x : true, y : false}}
					       size="middle"
					       dataSource={wallets}
					       loading={loading}/>
				</Widget>

				<div className="my-3">
					<Alert type="warning"
					       message={
						       <div className="font-weight-medium">
							       <FormattedMessage
								       defaultMessage="Important"
								       id="admin.wallets.important"/>
						       </div>
					       }
					       description={
						       <ol className="pl-3 mb-0">
							       <li>
								       <FormattedMessage
									       defaultMessage={
										       "A wallet can only be removed when it has no account with any user."
									       }
									       id="admin.wallets.wallet_removal_notice"/>
							       </li>
							       <li>
								       <FormattedMessage
									       defaultMessage={
										       "Wallet statistics are generated and cached for {minutes}. " +
										       "You may need to refresh the page periodically in order to get updated data."
									       }
									       values={{
										       minutes : <b>30 minutes</b>
									       }}
									       id="admin.wallets.wallet_statistics_notice"/>
							       </li>
							       <li>
								       <FormattedMessage
									       defaultMessage={
										       "Wallet balance here is the total evaluation of user balance, " +
										       "which does not reflect the actual balance on the wallet. " +
										       "Extra fees are charged on every users transaction based on the " +
										       "number of generated address. The excess will be used for " +
										       "consolidation of unspent inputs in the future."
									       }
									       id="admin.wallets.wallet_balance_notice"/>
							       </li>
						       </ol>
					       }
					       showIcon/>
				</div>
			</React.Fragment>

		);
	}
}

export default pipe(
	injectIntl
)(Overview);