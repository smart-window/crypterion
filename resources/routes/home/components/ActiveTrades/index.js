import React, {Component} from 'react';
import Widget from "components/Widget";
import AsyncTable from "components/AsyncTable";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {pipe} from "support/utils/common";
import Auth from "support/Auth";
import {route} from "support/Services/Api";
import UserTableCell from "components/UserTableCell";
import {isEmpty} from "lodash";
import {Button, Icon, Popover} from "antd";
import menuItemLinks from "containers/utils/menuItemLinks";
import {generatePath, withRouter} from "react-router-dom";

class ActiveTrades extends Component {
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

	goToChat = (chatId) => {
		const {history} = this.props;

		const path = generatePath(menuItemLinks['chat.view'].path, {
			token : chatId
		});

		if (!isEmpty(history)) {
			return history.push(path);
		}
	};

	columns = () => {
		return [
			{
				title     : (
					<FormattedMessage
						defaultMessage="Coin"
						id="common.coin"/>
				),
				dataIndex : 'coin_name',
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Amount"
						id="common.amount"/>
				),
				dataIndex : 'formatted_amount_price',
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Seller"
						id="common.seller"/>
				),
				dataIndex : 'seller',
				render    : (seller) => (
					<UserTableCell user={seller}/>
				)
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Buyer"
						id="common.buyer"/>
				),
				dataIndex : 'buyer',
				render    : (buyer) => (
					<UserTableCell user={buyer}/>
				)
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Payment Method"
						id="common.payment_method"/>
				),
				dataIndex : 'payment_method_name',
				render : (payment_method_name, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						<span className="mr-2">
							{payment_method_name}
						</span>
						{record.payment_method_description && (
							<Popover overlayStyle={{maxWidth : 250}}
							         content={record.payment_method_description}
							         title={
								         <FormattedMessage
									         id="common.payment_method_description"
									         defaultMessage="Description"/>
							         }
							         trigger="click">
								<Icon type="question-circle" theme="filled"/>
							</Popover>
						)}
					</div>
				)
			},
			{
				title  : (
					<FormattedMessage
						defaultMessage="Action"
						id="common.action"/>
				),
				key    : 'action',
				fixed  : 'right',
				render : (text, record) => {
					return (
						<Button type="primary"
						        onClick={() => this.goToChat(record.chat_id)}
						        icon="link"/>
					);
				},
			},
		];
	};

	render() {
		const {auth} = this.props;

		const endpoint = route("user.trades.table", {
			name : auth.user.name
		});

		return (
			<Widget styleName="cp-card-table full-grid-item scroll"
			        title={
				        <FormattedMessage
					        defaultMessage="Active Trades"
					        id="home.widget.active_trades"/>
			        }>
				<AsyncTable
					columns={this.columns()}
					ref={(table) => this.table = table}
					route={endpoint.url()}
					size="middle"
					scroll={{x : true, y : false}}
					className="mt-1"/>
			</Widget>
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
		mapStateToProps,
	),
	withRouter
)(ActiveTrades);



