import React, {Component} from 'react';
import {Button, Col, Drawer, Row} from "antd";
import Widget from "components/Widget";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import FilterResult from "components/FilterResult";
import AsyncTable from "components/AsyncTable";
import ApiService, {route} from "support/Services/Api";
import {generatePath, Link, withRouter} from "react-router-dom";
import {isEmpty, startCase, upperFirst} from "lodash"
import Auth from "support/Auth";
import {handleError, handleSuccess} from "support/utils/promise";
import menuItemLinks from "containers/utils/menuItemLinks";
import context from "context";
import {Helmet} from "react-helmet";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "profile.offers.action_successful"
	},
	pageTitle        : {
		defaultMessage : "{user}'s Offers - Profile | {name}",
		id             : "meta.title.profile_offers"
	},
});

class Offers extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			drawerState : false,
		}
	}

	componentWillUnmount() {
		this.api.cancel()
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

	goToOffer = (offer) => {
		const {history} = this.props;

		const path = generatePath(menuItemLinks['marketplace.offer'].path, {
			slug : offer.slug
		});

		if (!isEmpty(history)) {
			return history.push(path);
		}
	};

	editOffer = (offer) => {
		const {history} = this.props;

		const path = generatePath(menuItemLinks['marketplace.create_offer'].path);

		if (!isEmpty(history)) {
			return history.push(path, {offer});
		}
	};

	deleteOffer = (offer) => {
		const {axios, route} = this.api;
		const {intl, match} = this.props;
		const endpoint = route('user.offers.delete', {
			name : match.params.name
		});

		axios.post(endpoint.url(), {id : offer.id})
			.then(response => handleSuccess(response, (data) => {
				this.table.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	};

	hideOffer = (offer) => {
		const {axios, route} = this.api;
		const {intl, match} = this.props;
		const endpoint = route('user.offers.hide', {
			name : match.params.name
		});

		axios.post(endpoint.url(), {id : offer.id})
			.then(response => handleSuccess(response, (data) => {
				this.table.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	};

	showOffer = (offer) => {
		const {axios, route} = this.api;
		const {intl, match} = this.props;
		const endpoint = route('user.offers.show', {
			name : match.params.name
		});

		axios.post(endpoint.url(), {id : offer.id})
			.then(response => handleSuccess(response, (data) => {
				this.table.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	};

	columns = () => {
		const {auth} = this.props;
		return [
			{
				title     : (
					<FormattedMessage
						defaultMessage="Type"
						id="common.type"/>
				),
				dataIndex : 'type',
				render    : (text) => startCase(text)
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
						<small>
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
				render : (text, record) => {
					if (auth.user.id === record.user.id || auth.can('manage_marketplace')) {
						return (
							<div style={{whiteSpace : 'nowrap'}}>
								<Button onClick={(e) => this.editOffer(record)}
								        icon="edit"/>
								<Button onClick={(e) => this.deleteOffer(record)}
								        icon="delete"/>
								<Button onClick={(e) => this.goToOffer(record)}
								        icon="eye"/>
								{record.status ? (
									<Button onClick={(e) => this.hideOffer(record)}
									        type="default" className="cp-btn-danger"
									        icon="poweroff"/>
								) : (
									<Button onClick={(e) => this.showOffer(record)}
									        type="default" className="cp-btn-success"
									        icon="poweroff"/>
								)}
							</div>
						)
					} else {
						const path = generatePath(menuItemLinks['marketplace.offer'].path, {
							slug : record.slug
						});

						return (
							<Link to={path}>
								{record.type === 'sell' && (
									<Button type="default"
									        className="cp-btn-success"
									        size="small">
										<span>
											<FormattedMessage
												defaultMessage="Buy"
												id="common.buy"/>
										</span>
									</Button>
								)}

								{record.type === 'buy' && (
									<Button type="default"
									        className="cp-btn-danger"
									        size="small">
										<span>
											<FormattedMessage
												defaultMessage="Sell"
												id="common.sell"/>
										</span>
									</Button>
								)}
							</Link>
						)
					}
				},
			},
		];
	};

	getPageTitle() {
		const {intl, match} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			user : match.params.name,
			name : context.name,
		})
	}

	render() {
		const {match} = this.props;
		const {drawerState} = this.state;

		const endpoint = route("user.offers.table", {
			name : match.params.name
		});

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
								        defaultMessage="{name} Offers"
								        id="profile.offers.title"
								        values={{
									        name : <b>{upperFirst(match.params.name)}'s</b>
								        }}/>
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
)(Offers);
