import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import AsyncTable from "admin/components/AsyncTable";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import {formatUTCDate, pipe, truncate} from "admin/support/utils/common";
import Auth from "admin/support/Auth";
import ApiService, {route} from "admin/support/Services/Api";
import {Button, Modal} from "antd";
import {withRouter} from "react-router-dom";
import {handleError, handleSuccess} from "admin/support/utils/promise";

class FailedJobs extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
		}
	}

	clear = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.home.widget.failed-jobs.clear');

		this.setState({confirmLoading : true});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.setState({confirmLoading : false});
				this.table.fetchData();
			}))
			.catch(error => handleError(error, () => {
				this.setState({confirmLoading : false});
			}));
	};

	showException = (message) => {
		Modal.error({
			width        : 1000,
			maskClosable : true,
			content      : (
				<p style={{whiteSpace : 'pre-line'}}>
					{message}
				</p>
			)
		});
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	columns = () => {
		return [
			{
				title     : (
					<FormattedMessage
						defaultMessage="Queue"
						id="failed_jobs.queue"/>
				),
				dataIndex : 'queue',
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Exception"
						id="failed_jobs.exception"/>
				),
				dataIndex : 'exception',
				render    : (exception) => truncate(exception, 100)
			},
			{
				title     : (
					<FormattedMessage
						defaultMessage="Failed At"
						id="failed_jobs.failed_at"/>
				),
				dataIndex : 'failed_at',
				render    : (date) => (
					<span style={{whiteSpace : 'nowrap'}}>
						{formatUTCDate(date)}
					</span>
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
						<Button onClick={() => this.showException(record.exception)}
						        type="primary" icon="eye"/>
					);
				},
			},
		];
	};

	render() {
		const {confirmLoading} = this.state;
		const endpoint = route("admin.home.widget.failed-jobs.table");

		return (
			<Widget styleName="cp-card-table full-grid-item scroll"
			        extra={
				        <Button type="danger" shape="circle"
				                loading={confirmLoading}
				                className="m-0" icon="delete"
				                onClick={this.clear}/>
			        }
			        title={
				        <FormattedMessage
					        defaultMessage="Failed Jobs"
					        id="admin.widget.failed_jobs"/>
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
)(FailedJobs);



