import React, {Component} from 'react';
import {Divider, Table} from "antd";
import AddressesTable from "./components/AddressesTable";
import Auth from "support/Auth";
import {FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";

import {showDepositModal, showWithdrawModal} from "redux/actions/Wallet";

class AccountTable extends Component {
	showDepositModal(id) {
		this.props.showDepositModal(id);
	}

	showWithdrawModal(id) {
		this.props.showWithdrawModal(id);
	}

	columns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Coin"
					id="wallet.coin"/>,
				dataIndex : 'coin',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Available"
					id="wallet.available"/>,
				dataIndex : 'available',
			},
			{
				title     : <FormattedMessage
					defaultMessage="On Trade"
					id="wallet.on_trade"/>,
				dataIndex : 'balance_on_trade',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Valuation"
					id="wallet.valuation"/>,
				dataIndex : 'formatted_available_price',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="table.action"/>,
				key    : 'action',
				render : (text, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						<a onClick={(e) => this.showDepositModal(record.id)}>
							<FormattedMessage
								defaultMessage="Deposit"
								id="wallet.deposit"/>
						</a>
						<Divider type="vertical"/>
						<a onClick={(e) => this.showWithdrawModal(record.id)}>
							<FormattedMessage
								defaultMessage="Withdraw"
								id="wallet.withdraw"/>
						</a>
					</div>
				),
			},
		];
	};

	render() {
		const {accounts, accountsLoading, auth} = this.props;

		return (
			<Widget styleName="cp-card-table"
			        title={
				        <FormattedMessage
					        defaultMessage="Accounts List"
					        id="wallet.account_list"/>
			        }
			        extra={
				        <FormattedMessage
					        defaultMessage="Currency ({currency})"
					        id="wallet.currency_highlight"
					        values={{
					        	currency : auth.user.currency
					        }}/>
			        }>
				<Table columns={this.columns()}
				       className="mt-1"
				       expandedRowRender={(record) => (
					       <AddressesTable
						       pagination={{pageSize : 3}}
						       walletAccountId={record.id}/>
				       )}
				       loading={accountsLoading}
				       size="middle"
				       rowKey="id"
				       scroll={{x : true, y : false}}
				       dataSource={accounts}/>
			</Widget>
		);
	}
}

const mapStateToProps = ({
	wallet : {
		accountsLoading,
		accounts
	},
	auth
}) => ({
	accountsLoading,
	accounts,
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps,
		{
			showDepositModal,
			showWithdrawModal
		}
	)
)(AccountTable)