import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {pipe} from "admin/support/utils/common";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import context from "admin/context";
import {Icon, Result, Select, Spin} from "antd";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {isEmpty} from "lodash";

const {colorPalettes} = context.settings;

const messages = defineMessages({
	date  : {
		defaultMessage : "Date",
		id             : "widget.user_registrations_chart.date"
	},
	month : {
		defaultMessage : "Month",
		id             : "widget.user_registrations_chart.month"
	},
	total : {
		defaultMessage : "Total",
		id             : "widget.user_registrations_chart.total"
	},
});

class UserRegistrationsChart extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			type    : "month",
			data    : [],
			loading : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.home.widget.user-statistics.registrations-by-date-data');
		const {type} = this.state;

		this.setState({loading : true});

		axios.post(endpoint.url(), {type})
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false, data});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	onChangeType = (type) => {
		this.setState({type}, () => {
			this.fetchData();
		})
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	render() {
		const {intl} = this.props;
		const {type, data, loading} = this.state;
		return (
			<Widget styleName="cp-card-table full-grid-item"
			        title={
				        <FormattedMessage
					        defaultMessage="User Registrations"
					        id="admin.widget.user_registrations_chart"/>
			        }
			        extra={
				        <Select onChange={this.onChangeType}
				                style={{width : 100}} value={type}>
					        <Select.Option value="month">
						        <FormattedMessage
							        defaultMessage="This Month"
							        id="widget.user_registrations_chart.this_month"/>
					        </Select.Option>

					        <Select.Option value="year">
						        <FormattedMessage
							        defaultMessage="This Year"
							        id="widget.user_registrations_chart.this_year"/>
					        </Select.Option>
				        </Select>
			        }>
				{(!isEmpty(data) && !loading) ? (
					<ResponsiveContainer>
						<AreaChart margin={{top : 20, right : 10, left : 10, bottom : 20}}
						           data={data}>
							<XAxis dataKey="date" hide/>
							<CartesianGrid strokeDasharray="3 3"/>
							<YAxis/>
							<Tooltip/>
							<Area type="monotone"
							      name={intl.formatMessage(messages.total)}
							      fill={colorPalettes['@primary-color']}
							      stroke={colorPalettes['@primary-color']}
							      dataKey="total"/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<Spin spinning={loading}>
						<Result
							icon={
								<Icon type="frown"
								      twoToneColor={colorPalettes['@primary-color']}
								      theme="twoTone"/>
							}
							extra={
								<span className="text-muted">
									<FormattedMessage
										id="widget.user_registrations_chart.no_data"
										defaultMessage="No Data Yet."/>
								</span>
							}
							status="info"/>
					</Spin>
				)}
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
)(UserRegistrationsChart);