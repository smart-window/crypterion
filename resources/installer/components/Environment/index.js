import React, {Component} from 'react';
import ApiService from "installer/support/Services/Api";
import {FormattedMessage} from "react-intl";
import {Alert, Button, Col, Divider, Form, Input, Row, Select, Spin} from "antd";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "installer/support/utils/promise";
import {pipe} from "installer/support/utils/common";
import formHelper from "installer/support/Helpers/Form";
import {assign, isEmpty} from "lodash";

class Environment extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
			loading        : false
		};
	}

	fetchData() {
		const {licenseDetails, form} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('installer.environment.data');
		this.setState({loading : true});

		axios.post(endpoint.url(), {license : licenseDetails})
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false});
				form.setFieldsValue(data);
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {form, licenseDetails} = this.props;
		const {axios, route} = this.api;
		form.validateFieldsAndScroll((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('installer.environment.update');

				const data = assign({}, values, {license : licenseDetails});

				axios.post(endpoint.url(), data)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.triggerSuccess()
					}))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess = () => {
		const {onSave} = this.props;
		if (typeof onSave === "function") {
			return onSave();
		}
	};

	prev = () => {
		const {onPrev} = this.props;
		if (typeof onPrev === "function") {
			return onPrev();
		}
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {loading, confirmLoading} = this.state;
		const {visible, form, documentation} = this.props;
		const {getFieldDecorator, getFieldValue} = form;

		return (
			<div className={`${visible ? 'd-block' : 'd-none'}`}>
				<div className="text-center mb-4">
					<h1>
						<FormattedMessage
							defaultMessage="Environment"
							id="installer.environment"/>
					</h1>
				</div>
				<Row>
					<Col xl={16} className="mb-3">
						<Spin spinning={loading}>
							<Form onSubmit={this.handleSubmit}>
								<div className="mb-5">
									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Name">
												{getFieldDecorator("APP_NAME", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="URL">
												{getFieldDecorator("APP_URL", {
													rules : [{type : 'url'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>
								</div>

								<div className="mb-5">
									<Divider>
										Redis
									</Divider>
									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Host">
												{getFieldDecorator("REDIS_HOST", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Port">
												{getFieldDecorator("REDIS_PORT", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>

									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Password">
												{getFieldDecorator("REDIS_PASSWORD", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>
								</div>

								<div className="mb-5">
									<Divider>
										Database
									</Divider>

									{getFieldValue("DB_CONNECTION") === "sqlite" && (
										<div className="my-3">
											<Alert type="info"
											       message={
												       <FormattedMessage
													       defaultMessage={
														       "The database value for SQLLite should be the full path " +
														       "to the database file which is writable by the server"
													       }
													       id="installer.sqlite_info"/>
											       }
											       showIcon/>
										</div>
									)}

									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Connection">
												{getFieldDecorator("DB_CONNECTION", {
													rules : [{type : 'string'}],
												})(
													<Select>
														<Select.Option value="sqlite">
															SQLite
														</Select.Option>
														<Select.Option value="mysql">
															MySql
														</Select.Option>
														<Select.Option value="pgsql">
															pgSQL
														</Select.Option>
														<Select.Option value="sqlsrv">
															SQLSRV
														</Select.Option>
													</Select>
												)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Database">
												{getFieldDecorator("DB_DATABASE", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>

									<Row gutter={8}
									     className={`${getFieldValue("DB_CONNECTION") === "sqlite" && "d-none"}`}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Host">
												{getFieldDecorator("DB_HOST", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Port">
												{getFieldDecorator("DB_PORT", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>

									<Row gutter={8}
									     className={`${getFieldValue("DB_CONNECTION") === "sqlite" && "d-none"}`}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Username">
												{getFieldDecorator("DB_USERNAME", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Password">
												{getFieldDecorator("DB_PASSWORD", {
													rules : [{type : 'string'}],
												})(<Input.Password/>)}
											</Form.Item>
										</Col>
									</Row>
								</div>

								<div className="mb-5">
									<Divider>
										Pusher
									</Divider>
									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Pusher App Id">
												{getFieldDecorator("PUSHER_APP_ID", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Pusher App Secret">
												{getFieldDecorator("PUSHER_APP_SECRET", {
													rules : [{type : 'string'}],
												})(<Input.Password/>)}
											</Form.Item>
										</Col>
									</Row>

									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Pusher App Key">
												{getFieldDecorator("PUSHER_APP_KEY", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Pusher App Cluster">
												{getFieldDecorator("PUSHER_APP_CLUSTER", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>
								</div>

								<div className="mb-5">
									<Divider>
										BitGo Express
									</Divider>
									<Row gutter={8}>
										<Col xl={12}>
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
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Token">
												{getFieldDecorator("BITGO_TOKEN", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>

									<Row gutter={8}>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Host">
												{getFieldDecorator("BITGO_HOST", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
										<Col xl={12}>
											<Form.Item labelAlign="left"
											           label="Port">
												{getFieldDecorator("BITGO_PORT", {
													rules : [{type : 'string'}],
												})(<Input/>)}
											</Form.Item>
										</Col>
									</Row>
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

								<Form.Item className="mt-4 text-right">
									<Button shape="round"
									        onClick={this.prev}>
										<span>
											<FormattedMessage
												defaultMessage="Previous"
												id="installer.previous"/>
										</span>
									</Button>

									<Button htmlType="submit"
									        type="primary" shape="round"
									        loading={confirmLoading}>
										<span>
											<FormattedMessage
												defaultMessage="Save"
												id="installer.save"/>
										</span>
									</Button>
								</Form.Item>
							</Form>
						</Spin>
					</Col>

					<Col xl={8}>
						<div className="px-xl-3 ml-xl-3 cp-border-left-xl">
							<h2>
								<FormattedMessage
									defaultMessage="About this page"
									id="installer.about_page"/>
							</h2>

							<p className="text-justify">
								<FormattedMessage
									defaultMessage={
										"You are able to setup your environment values using this form. " +
										"This attempts to update the {env} file directly. We advise that you " +
										"make regular backup of this file in the event of a failure. You " +
										"should make references to the official documentation on how to obtain " +
										"the required environment details."
									}
									values={{
										env : <b>.env</b>
									}}
									id="installer.environment_information_1"/>
							</p>

							<p className="text-justify">
								<FormattedMessage
									defaultMessage={
										"The {null} value can be used in the place of fields that are not applicable."
									}
									values={{
										null : <b>null</b>
									}}
									id="installer.environment_information_2"/>
							</p>

							<p className="text-center my-3">
								<Button type="default" shape="round"
								        href={documentation}
								        size="large" icon="file-word">
									<span>
										<FormattedMessage
											defaultMessage="Documentation"
											id="installer.documentation"/>
									</span>
								</Button>
							</p>
						</div>
					</Col>
				</Row>
			</div>
		);
	}
}

export default pipe(
	formHelper(),
)(Environment);