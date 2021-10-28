import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService, {route} from "support/Services/Api";
import AsyncTable from "components/AsyncTable";
import {Button, Tooltip} from "antd";
import {handleError, handleSuccess} from "support/utils/promise";
import {pipe} from "support/utils/common";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "wallet.action_successful"
	},
});

class AddressesTable extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();
	}

	getColumn = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Address"
					id="wallet.address"/>,
				dataIndex : 'address',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Total Received"
					id="wallet.address_total_received"/>,
				dataIndex : 'total_received',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="wallet.action"/>,
				key    : 'action',
				render : (text, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						{record.reset_webhook && (
							<Tooltip title="Reset Webhook">
								<Button className="m-0 mx-1" shape="circle"
								        onClick={() => this.resetWebhook(record)}
								        type="primary" icon="sync"/>
							</Tooltip>
						)}
					</div>
				)
			},
		];
	};

	resetWebhook(address) {
		const {axios, route} = this.api;
		const {intl, walletAccountId} = this.props;

		const endpoint = route('user.wallet-account.wallet-address.reset-webhook', {
			walletAccount : walletAccountId,
			walletAddress : address.id
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.table.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	}

	render() {
		const {walletAccountId} = this.props;

		const endpoint = route("user.wallet-account.wallet-address.table", {
			walletAccount : walletAccountId
		});

		return (
			<AsyncTable
				route={endpoint.url()}
				pagination={{pageSize : 3}}
				size="small"
				ref={(ref) => this.table = ref}
				columns={this.getColumn()}
				className="mt-1"/>
		);
	}
}

export default pipe(
	injectIntl
)(AddressesTable);