import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService, {route} from "support/Services/Api";
import menuItemLinks from "containers/utils/menuItemLinks";
import {isEmpty, upperFirst} from "lodash";
import {generatePath, withRouter} from "react-router-dom";
import {Button, Icon, Popover, Tag} from "antd";
import UserTableCell from "components/UserTableCell";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import AsyncTable from "components/AsyncTable";
import Widget from "components/Widget";
import context from "context";
import {Helmet} from "react-helmet";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Trades - Profile | {name}",
		id             : "meta.title.profile_trades"
	},
});

class Trades extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();
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
						defaultMessage="Status"
						id="common.status"/>
				),
				dataIndex : 'status',
				render    : (status) => (
					<Tag color={this.getStatusColor(status)}>
						{upperFirst(status)}
					</Tag>
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
						        onClick={(e) => this.goToChat(record.chat_id)}
						        icon="link"/>
					);
				},
			},
		];
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const {match} = this.props;

		const endpoint = route("user.trades.table", {
			name : match.params.name
		});

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
						        defaultMessage="{name} Trades"
						        id="profile.trades.title"
						        values={{
							        name : <b>{upperFirst(match.params.name)}'s</b>
						        }}/>
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
	withRouter
)(Trades);