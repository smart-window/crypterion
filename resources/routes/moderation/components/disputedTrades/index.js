import React, {Component} from 'react';
import ApiService, {route} from "support/Services/Api";
import menuItemLinks from "containers/utils/menuItemLinks";
import {isEmpty} from "lodash";
import {generatePath} from "react-router-dom";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import UserTableCell from "components/UserTableCell";
import {Button, Icon, Popover} from "antd";
import Widget from "components/Widget";
import AsyncTable from "components/AsyncTable";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import {pipe} from "support/utils/common";
import context from "context";
import {Helmet} from "react-helmet";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Disputed Trades - Moderation | {name}",
		id             : "meta.title.moderation_disputed_trades"
	},
});

class DisputedTrades extends Component {
	constructor(props) {
		super(props);

		this.broadcast = new PrivateBroadcast();
		this.api = new ApiService();
	}

	componentDidMount() {
		this.bindBroadcastEvents();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('MarketplaceTradeSaved', this.marketplaceTradeSavedListener);
	}

	marketplaceTradeSavedListener = (e) => {
		this.table.fetchData();
	};

	resetBroadcastChannel() {
		this.broadcast.setChannel('Permission.ManageMarketplace')
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
						defaultMessage="Rate"
						id="common.rate"/>
				),
				dataIndex : 'formatted_rate',
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Payment Method"
						id="common.payment_method"/>
				),
				dataIndex : 'payment_method_name',
				render    : (payment_method_name, record) => (
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
						        onClick={(e) => this.goToChat(record.chat_id)}
						        icon="link"/>
					);
				},
			},
		];
	};

	componentWillUnmount() {
		this.broadcast.unbind();
		this.api.cancel()
	}

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const endpoint = route("moderation.disputed-trades.table");

		return (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<Widget styleName="cp-card-table"
				        title={
					        <FormattedMessage
						        defaultMessage="Disputed Trades"
						        id="moderation.disputed_trades"/>
				        }>
					<AsyncTable
						route={endpoint.url()}
						columns={this.columns()}
						className="mt-1"
						ref={(table) => this.table = table}
						scroll={{x : true, y : false}}
						size="middle"/>
				</Widget>
			</React.Fragment>
		);
	}
}

export default pipe(
	injectIntl,
)(DisputedTrades);