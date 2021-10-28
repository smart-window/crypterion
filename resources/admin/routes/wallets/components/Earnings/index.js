import React, {Component} from 'react';
import {FormattedMessage, injectIntl} from "react-intl";
import Widget from "admin/components/Widget";
import AsyncTable from "admin/components/AsyncTable";
import {pipe} from "admin/support/utils/common";
import ApiService from "admin/support/Services/Api";

class Earnings extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();
	}

	columns = () => {
		return [
			{
				title  : <FormattedMessage
					defaultMessage="Wallet"
					id="admin.wallets.wallet"/>,
				key    : 'coin',
				render : (text, record) => (
					record.wallet_account.wallet.coin.name
				)
			},
			{
				title     : <FormattedMessage
					defaultMessage="Amount"
					id="admin.wallets.amount"/>,
				dataIndex : 'formatted_amount',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Description"
					id="admin.wallets.description"/>,
				dataIndex : 'description',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Recipient"
					id="admin.wallets.recipient"/>,
				key    : 'recipient',
				render : (text, record) => (
					record.wallet_account.user.name
				)
			},
		];
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {route} = this.api;
		const endpoint = route("admin.wallets.earnings.marketplace-table");

		return (
			<Widget styleName="cp-card-table"
			        title={
				        <FormattedMessage
					        defaultMessage="Marketplace Earnings"
					        id="admin.wallets.marketplace_earnings"/>
			        }>
				<AsyncTable
					columns={this.columns()}
					route={endpoint.url()}
					rowKey="id"
					ref={(table) => this.table = table}
					className="mt-1"
					scroll={{x : true, y : false}}
					size="middle"/>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
)(Earnings);