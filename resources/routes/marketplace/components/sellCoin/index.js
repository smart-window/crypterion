import React, {Component} from 'react';
import {Button, Col, Drawer, Row} from "antd";
import Widget from "components/Widget";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import FilterResult from "components/FilterResult";
import AsyncTable from "components/AsyncTable";
import {route} from "support/Services/Api";
import UserTableCell from "components/UserTableCell";
import {generatePath, Link} from "react-router-dom";
import menuItemLinks from "containers/utils/menuItemLinks";
import {pipe} from "support/utils/common";
import context from "context";
import {Helmet} from "react-helmet";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Sell Coin - Marketplace | {name}",
		id             : "meta.title.marketplace_sell_coin"
	},
});

class SellCoin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			drawerState : false,
		}
	}

	applyFilter = (filters) => {
		this.setState({drawerState : false}, () => {
			this.table.applyFilter(filters);
		})
	};

	clearFilter = () => {
		this.setState({drawerState : false}, () => {
			this.table.clearFilter();
		})
	};

	toggleDrawer = () => {
		this.setState(({drawerState}) => {
			return {
				drawerState : !drawerState
			};
		});
	};

	columns = () => {
		return [
			{
				title     : (
					<FormattedMessage
						defaultMessage="Buyer"
						id="common.buyer"/>
				),
				dataIndex : 'user',
				render    : (user) => (
					<UserTableCell user={user}/>
				)
			},
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
						defaultMessage="Payment"
						id="common.payment"/>
				),
				dataIndex : 'payment_method',
				render    : (paymentMethod, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						<span className="d-block">
							{paymentMethod.name}
						</span>
						<small className="d-block">
							{record.label}
						</small>
					</div>
				)
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Currency"
						id="common.currency"/>
				),
				dataIndex : 'currency',
			},
			{
				title  : (
					<FormattedMessage
						defaultMessage="Range"
						id="common.range"/>
				),
				key    : 'range',
				render : (text, record) => (
					<span>
						<span style={{whiteSpace : 'nowrap'}}>
							{record.formatted_min_amount}
						</span>
						<span className="font-weight-semi-bold mx-2">
							<FormattedMessage
								defaultMessage="To"
								id="common.to"/>
						</span>
						<span style={{whiteSpace : 'nowrap'}}>
							{record.formatted_real_max_amount}
						</span>
					</span>
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
                        defaultMessage="Margin"
                        id="common.margin"/>
                ),
                dataIndex : 'profit_margin',
                render : (margin) => `${(margin || 0)}%`
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
					const path = generatePath(menuItemLinks['marketplace.offer'].path, {
						slug : record.slug
					});

					return (
						<Link to={path}>
							<Button type="default"
							        className="cp-btn-danger"
							        size="small">
								<span>
									<FormattedMessage
										defaultMessage="Sell"
										id="common.sell"/>
								</span>
							</Button>
						</Link>
					)
				},
			},
		];
	};

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const {drawerState} = this.state;
		const endpoint = route("marketplace.sell-coin.table");

		const filterResultComponent = (
			<FilterResult
				onApplyFilter={this.applyFilter}
				onClearFilter={this.clearFilter}/>
		);

		return (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<Row gutter={8}>
					<Col lg={8} xl={6}>
						<Widget styleName="d-none d-lg-block"
						        title={
							        <FormattedMessage
								        defaultMessage="Filter Result"
								        id="common.filter_result"/>
						        }>
							{filterResultComponent}
						</Widget>
					</Col>

					<Col lg={16} xl={18}>
						<div className="d-block d-lg-none">
							<Drawer
								visible={drawerState}
								onClose={this.toggleDrawer}
								placement="right"
								title={
									<FormattedMessage
										defaultMessage="Filter Result"
										id="common.filter_result"/>
								}
								closable={false}>
								<div className="p-2">
									{filterResultComponent}
								</div>
							</Drawer>
						</div>

						<Widget styleName="cp-card-table"
						        title={
							        <FormattedMessage
								        defaultMessage="Available Offers"
								        id="marketplace.available_offers"/>
						        }
						        extra={
							        <Button type="primary" shape="circle"
							                className="mb-0 material-shadow d-block d-lg-none"
							                icon="filter"
							                onClick={this.toggleDrawer}/>
						        }>
							<AsyncTable
								route={endpoint.url()}
								columns={this.columns()}
								className="mt-1"
								ref={(table) => this.table = table}
								scroll={{x : true, y : false}}
								size="middle"/>
						</Widget>
					</Col>
				</Row>
			</React.Fragment>
		);
	}
}

export default pipe(
	injectIntl,
)(SellCoin);
