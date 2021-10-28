import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import Widget from "admin/components/Widget";
import {Spin} from "antd";
import millify from "millify";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";

class MarketplaceStatistics extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			totalOffers           : 0,
			totalActiveTrades     : 0,
			totalSuccessfulTrades : 0,
			totalDisputeTrades    : 0,
			totalCancelledTrades  : 0,
			loading               : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.home.widget.marketplace-statistics.data');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					totalOffers           : data.total_offers || 0,
					totalActiveTrades     : data.total_active_trades || 0,
					totalSuccessfulTrades : data.total_successful_trades || 0,
					totalDisputeTrades    : data.total_dispute_trades || 0,
					totalCancelledTrades  : data.total_cancelled_trades || 0,
					loading               : false,
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	render() {
		const {
			totalOffers,
			totalActiveTrades,
			totalSuccessfulTrades,
			totalDisputeTrades,
			totalCancelledTrades,
			loading,
		} = this.state;

		return (
			<Widget styleName="full-grid-item cp-card-full"
			        title={
				        <FormattedMessage
					        defaultMessage="Marketplace Statistics"
					        id="admin.widget.marketplace_statistics"/>
			        }>
				<div className="p-3">
					<Spin spinning={loading}>
						<ul className="cp-list-group m-0">
							<li className="d-flex align-items-center">
								<i className="la la-clock fs-lg"/>
								<span>
									<FormattedMessage
										defaultMessage="{total} Active Trades"
										id="admin.widget.marketplace_statistics.active_trades"
										values={{
											total : <b>{millify(totalActiveTrades)}</b>
										}}/>
								</span>
							</li>
							<li className="d-flex align-items-center">
								<i className="la la-check-circle fs-lg"/>
								<span>
									<FormattedMessage
										defaultMessage="{total} Successful Trades"
										id="admin.widget.marketplace_statistics.successful_trades"
										values={{
											total : <b>{millify(totalSuccessfulTrades)}</b>
										}}/>
								</span>
							</li>
							<li className="d-flex align-items-center">
								<i className="la la-exclamation-triangle fs-lg"/>
								<span>
									<FormattedMessage
										defaultMessage="{total} Disputed Trades"
										id="admin.widget.marketplace_statistics.disputed_trades"
										values={{
											total : <b>{millify(totalDisputeTrades)}</b>
										}}/>
								</span>
							</li>
							<li className="d-flex align-items-center">
								<i className="la la-stop fs-lg"/>
								<span>
									<FormattedMessage
										defaultMessage="{total} Cancelled Trades"
										id="admin.widget.marketplace_statistics.cancelled_trades"
										values={{
											total : <b>{millify(totalCancelledTrades)}</b>
										}}/>
								</span>
							</li>
							<li className="d-flex align-items-center">
								<i className="la la-briefcase fs-lg"/>
								<span>
									<FormattedMessage
										defaultMessage="{total} Offers"
										id="admin.widget.marketplace_statistics.offers"
										values={{
											total : <b>{millify(totalOffers)}</b>
										}}/>
								</span>
							</li>
						</ul>
					</Spin>
				</div>
			</Widget>
		);
	}
}

export default MarketplaceStatistics;