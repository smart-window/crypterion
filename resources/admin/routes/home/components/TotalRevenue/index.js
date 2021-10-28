import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import {FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {Spin} from "antd";

class TotalRevenue extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			totalEarnings          : 0,
			formattedTotalEarnings : "",
			loading                : false,
			currency               : "USD",
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.home.widget.statistics.total-earnings');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					totalEarnings          : data.total_earnings || 0,
					formattedTotalEarnings : data.formatted_total_earnings || "",
					loading                : false,
					currency               : data.currency || "USD",
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
		const {loading, formattedTotalEarnings} = this.state;
		return (
			<Spin spinning={loading}>
				<Widget styleName="cp-card-full p-4 text-center m-0">
					<div className="cp-media align-items-center flex-nowrap">
						<div className="mr-3">
							<i className="la la-funnel-dollar fs-3x"/>
						</div>
						<div className="cp-media-body">
							<h1 className="fs-xxl font-weight-semi-bold mb-2">
								{formattedTotalEarnings}
							</h1>
							<p className="mb-0">
								<FormattedMessage
									defaultMessage="Total Revenue"
									id="admin.total_revenue"/>
							</p>
						</div>
					</div>
				</Widget>
			</Spin>
		);
	}
}

export default TotalRevenue;