import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import millify from "millify";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {FormattedMessage} from "react-intl";
import {Spin} from "antd";

class TotalUsers extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			total   : 0,
			loading : false
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.home.widget.statistics.total-users');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					total   : data.total || 0,
					loading : false
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {total, loading} = this.state;
		return (
			<Spin spinning={loading}>
				<Widget styleName="cp-card-full p-4 text-center m-0">
					<div className="cp-media align-items-center flex-nowrap">
						<div className="mr-3">
							<i className="la la-user-plus fs-3x"/>
						</div>
						<div className="cp-media-body">
							<h1 className="fs-xxl font-weight-semi-bold mb-2">
								{millify(total)}
							</h1>
							<p className="mb-0">
								<FormattedMessage
									defaultMessage="Total Users"
									id="admin.total_users"/>
							</p>
						</div>
					</div>
				</Widget>
			</Spin>
		);
	}
}

export default TotalUsers;