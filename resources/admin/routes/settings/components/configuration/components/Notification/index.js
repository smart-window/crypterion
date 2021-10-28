import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "admin/components/Widget";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import ApiService from "admin/support/Services/Api";
import {Alert, Button, Form, Spin, Switch} from "antd";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "admin/support/utils/promise";
import {isEmpty} from "lodash";

const messages = defineMessages({
	successful : {
		defaultMessage : "Notification updated successfully.",
		id             : "admin.configuration.updated_notification_successfully"
	},
});

class Notification extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
			loading        : false
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {axios, route} = this.api;
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('admin.settings.configuration.notification.update');

				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.fetchData()
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	fetchData() {
		const {axios, route} = this.api;
		const {form} = this.props;
		const endpoint = route('admin.settings.configuration.notification.data');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false});
				form.setFieldsValue(data);
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {form} = this.props;
		const {loading, confirmLoading} = this.state;
		const {getFieldDecorator} = form;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Notification"
						id="admin.configuration.notification"/>
				}>
				<Spin spinning={loading}>
					<Form onSubmit={this.handleSubmit}
					      wrapperCol={{xs : 24, sm : 16}}
					      labelCol={{xs : 24, sm : 8}}>

						<div className="mb-3">
							<Alert type="info"
							       message={
								       <FormattedMessage
									       defaultMessage={
										       "We will attempt to send a test notification before we enable a channel. " +
										       "Do make sure that the related environment variable has been setup " +
										       "and your profile has the needed route to send the test notification to."
									       }
									       id="admin.configuration.enable_channel_info"/>
							       }
							       showIcon/>
						</div>

						<Form.Item labelAlign="left"
						           wrapperCol={{xs : 8, md: 16}}
						           labelCol={{xs : 16, md: 8}}
						           label={
							           <FormattedMessage
								           defaultMessage="Enable Email"
								           id="admin.configuration.enable_email"/>
						           }>
							{getFieldDecorator("enable_email",{
								valuePropName : "checked"
							})(<Switch/>)}
						</Form.Item>

						<Form.Item labelAlign="left"
						           wrapperCol={{xs : 8, md: 16}}
						           labelCol={{xs : 16, md: 8}}
						           label={
							           <FormattedMessage
								           defaultMessage="Enable Database"
								           id="admin.configuration.enable_database"/>
						           }>
							{getFieldDecorator("enable_database",{
								valuePropName : "checked"
							})(<Switch/>)}
						</Form.Item>


						<Form.Item labelAlign="left"
						           wrapperCol={{xs : 8, md: 16}}
						           labelCol={{xs : 16, md: 8}}
						           label={
							           <FormattedMessage
								           defaultMessage="Enable SMS"
								           id="admin.configuration.enable_sms"/>
						           }>
							{getFieldDecorator("enable_sms", {
								valuePropName : "checked"
							})(<Switch/>)}
						</Form.Item>


						<Form.Item className="mb-0">
							<Button type="primary" icon="save"
							        htmlType="submit" loading={confirmLoading}
							        shape="round">
								<span>
									<FormattedMessage
										defaultMessage="Submit"
										id="common.submit"/>
								</span>
							</Button>
						</Form.Item>
					</Form>
				</Spin>
			</Widget>
		);
	}
}

export default pipe(
	formHelper(),
)(Notification);
