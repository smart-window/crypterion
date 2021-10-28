import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "admin/components/Widget";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import ApiService from "admin/support/Services/Api";
import {Alert, Button, Divider, Form, Input, Select, Spin, Switch} from "antd";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "admin/support/utils/promise";
import {isEmpty} from "lodash";

const messages = defineMessages({
	successful : {
		defaultMessage : "Environment updated successfully.",
		id             : "admin.configuration.updated_environment_successfully"
	},
});

class Environment extends Component {
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
		form.validateFieldsAndScroll((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('admin.settings.configuration.environment.update');

				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
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
		const endpoint = route('admin.settings.configuration.environment.data');

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
		const {loading, confirmLoading} = this.state;
		const {form} = this.props;
		const {getFieldDecorator, getFieldValue} = form;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Environment"
						id="admin.configuration.environment"/>
				}>
				<Spin spinning={loading}>
					<div className="mb-3">
						<Alert type="warning"
						       message={
							       <FormattedMessage
								       defaultMessage={
									       "This form may be used to update your environment variables {env}. " +
									       "We strongly recommend that you make a full backup of this file " +
									       "before you proceed."
								       }
								       values={{
									       env : <b>(.env)</b>
								       }}
								       id="admin.configuration.environment_info"/>
						       }
						       showIcon/>
					</div>

					<Form onSubmit={this.handleSubmit}
					      wrapperCol={{xs : 24, sm : 16}}
					      labelCol={{xs : 24, sm : 8}}>
						<div className="mb-5">
							<Form.Item labelAlign="left"
							           label="Name">
								{getFieldDecorator("APP_NAME", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="URL">
								{getFieldDecorator("APP_URL", {
									rules : [{type : 'url'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								Redis
							</Divider>

							<Form.Item labelAlign="left"
							           label="Host">
								{getFieldDecorator("REDIS_HOST", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Password">
								{getFieldDecorator("REDIS_PASSWORD", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Port">
								{getFieldDecorator("REDIS_PORT", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								Broadcast
							</Divider>

							<Form.Item labelAlign="left"
							           label="Driver">
								{getFieldDecorator("BROADCAST_DRIVER", {
									rules : [{type : 'string'}],
								})(
									<Select>
										<Select.Option value="pusher">
											Pusher
										</Select.Option>

										<Select.Option value="redis">
											Redis
										</Select.Option>
									</Select>
								)}
							</Form.Item>
						</div>

						<div className={`mb-5 ${getFieldValue("BROADCAST_DRIVER") !== "pusher" && "d-none"}`}>
							<Divider>
								Pusher
							</Divider>

							<Form.Item labelAlign="left"
							           label="Pusher App Id">
								{getFieldDecorator("PUSHER_APP_ID", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Pusher App Secret">
								{getFieldDecorator("PUSHER_APP_SECRET", {
									rules : [{type : 'string'}],
								})(<Input.Password/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Pusher App Key">
								{getFieldDecorator("PUSHER_APP_KEY", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Pusher App Cluster">
								{getFieldDecorator("PUSHER_APP_CLUSTER", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								Mail
							</Divider>

							<Form.Item labelAlign="left"
							           label="Driver">
								{getFieldDecorator("MAIL_DRIVER", {
									rules : [{type : 'string'}],
								})(
									<Select>
										<Select.Option value="smtp">
											SMTP
										</Select.Option>

										<Select.Option value="sendmail">
											Sendmail
										</Select.Option>
									</Select>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="From Name">
								{getFieldDecorator("MAIL_FROM_NAME", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="From Address">
								{getFieldDecorator("MAIL_FROM_ADDRESS", {
									rules : [{type : 'email'}],
								})(<Input/>)}
							</Form.Item>

							<div className={`${getFieldValue("MAIL_DRIVER") !== "smtp" && "d-none"}`}>
								<Form.Item labelAlign="left"
								           label="Host">
									{getFieldDecorator("MAIL_HOST", {
										rules : [{type : 'string'}],
									})(<Input/>)}
								</Form.Item>

								<Form.Item labelAlign="left"
								           label="Port">
									{getFieldDecorator("MAIL_PORT", {
										rules : [{type : 'string'}],
									})(<Input/>)}
								</Form.Item>

								<Form.Item labelAlign="left"
								           label="Username">
									{getFieldDecorator("MAIL_USERNAME", {
										rules : [{type : 'string'}],
									})(<Input/>)}
								</Form.Item>

								<Form.Item labelAlign="left"
								           label="Password">
									{getFieldDecorator("MAIL_PASSWORD", {
										rules : [{type : 'string'}],
									})(<Input.Password/>)}
								</Form.Item>

								<Form.Item labelAlign="left"
								           label="Encryption">
									{getFieldDecorator("MAIL_ENCRYPTION", {
										rules : [{type : 'string'}],
									})(<Input/>)}
								</Form.Item>
							</div>
						</div>

						<div className="mb-5">
							<Divider>
								SMS
							</Divider>

							<Form.Item labelAlign="left"
							           label="Provider">
								{getFieldDecorator("SMS_PROVIDER", {
									rules : [{type : 'string'}],
								})(
									<Select>
										<Select.Option value="twilio">
											Twilio
										</Select.Option>

										<Select.Option value="africastalking">
											Africastalking
										</Select.Option>

										<Select.Option value="nexmo">
											Nexmo
										</Select.Option>
									</Select>
								)}
							</Form.Item>
						</div>

						<div className={`mb-5 ${getFieldValue("SMS_PROVIDER") !== "twilio" && "d-none"}`}>
							<Divider>
								Twilio
							</Divider>

							<Form.Item labelAlign="left"
							           label="Token">
								{getFieldDecorator("TWILIO_TOKEN", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="ID">
								{getFieldDecorator("TWILIO_ID", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Number">
								{getFieldDecorator("TWILIO_NUMBER", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className={`mb-5 ${getFieldValue("SMS_PROVIDER") !== "africastalking" && "d-none"}`}>
							<Divider>
								AfricasTalking
							</Divider>

							<Form.Item labelAlign="left"
							           label="Username">
								{getFieldDecorator("AFRICASTALKING_USERNAME", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Key">
								{getFieldDecorator("AFRICASTALKING_KEY", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="From">
								{getFieldDecorator("AFRICASTALKING_FROM", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Enqueue">
								{getFieldDecorator("AFRICASTALKING_ENQUEUE", {
									valuePropName : "checked",
								})(<Switch/>)}
							</Form.Item>
						</div>

						<div className={`mb-5 ${getFieldValue("SMS_PROVIDER") !== "nexmo" && "d-none"}`}>
							<Divider>
								Nexmo
							</Divider>

							<Form.Item labelAlign="left"
							           label="Key">
								{getFieldDecorator("NEXMO_KEY", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Secret">
								{getFieldDecorator("NEXMO_SECRET", {
									rules : [{type : 'string'}],
								})(<Input.Password/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Phone">
								{getFieldDecorator("NEXMO_PHONE", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								Google Recaptcha
							</Divider>

							<Form.Item labelAlign="left"
							           label="Type">
								{getFieldDecorator("GOOGLE_RECAPTCHA_TYPE", {
									rules : [{type : 'string'}],
								})(
									<Select>
										<Select.Option value="normal">
											Normal
										</Select.Option>
										<Select.Option value="invisible">
											Invisible
										</Select.Option>
										<Select.Option value="compact">
											Compact
										</Select.Option>
									</Select>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Enable">
								{getFieldDecorator("GOOGLE_RECAPTCHA_ENABLE", {
									valuePropName : "checked"
								})(<Switch/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Key">
								{getFieldDecorator("GOOGLE_RECAPTCHA_SITEKEY", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Secret">
								{getFieldDecorator("GOOGLE_RECAPTCHA_SECRET", {
									rules : [{type : 'string'}],
								})(<Input.Password/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								BitGo Express
							</Divider>

							<Form.Item labelAlign="left"
							           label="Env">
								{getFieldDecorator("BITGO_ENV", {
									rules : [{type : 'string'}],
								})(
									<Select>
										<Select.Option value="test">
											Test
										</Select.Option>
										<Select.Option value="prod">
											Production
										</Select.Option>
									</Select>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Token">
								{getFieldDecorator("BITGO_TOKEN", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Host">
								{getFieldDecorator("BITGO_HOST", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label="Port">
								{getFieldDecorator("BITGO_PORT", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								CryptoCompare
							</Divider>

							<Form.Item labelAlign="left"
							           label="Key">
								{getFieldDecorator("CRYPTOCOMPARE_KEY", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

						<div className="mb-5">
							<Divider>
								Open Exchange Rates
							</Divider>

							<Form.Item labelAlign="left"
							           label="Key">
								{getFieldDecorator("OER_KEY", {
									rules : [{type : 'string'}],
								})(<Input/>)}
							</Form.Item>
						</div>

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
)(Environment);
