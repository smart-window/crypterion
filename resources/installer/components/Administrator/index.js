import React, {Component} from 'react';
import ApiService from "installer/support/Services/Api";
import {defineMessages, FormattedMessage} from "react-intl";
import {Button, Col, Form, Icon, Input, Row} from "antd";
import {pipe} from "installer/support/utils/common";
import formHelper from "installer/support/Helpers/Form";
import {assign, isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "installer/support/utils/promise";

const messages = defineMessages({
	username : {
		defaultMessage : "Username",
		id             : "installer.username"
	},

	email : {
		defaultMessage : "Email",
		id             : "installer.email"
	},

	successful : {
		defaultMessage : "Registered Successfully!",
		id             : "installer.registered_successful"
	},

	password : {
		defaultMessage : "Password",
		id             : "installer.password"
	},

	verifyPassword : {
		defaultMessage : "Verify Password",
		id             : "installer.verify_password"
	},

	invalidUsername : {
		defaultMessage : "Invalid username format.",
		id             : "installer.invalid_username"
	},
});


class Administrator extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {form, licenseDetails} = this.props;
		const {axios, route} = this.api;
		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('installer.administrator.register');

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
		const {onRegister} = this.props;
		if (typeof onRegister === "function") {
			return onRegister();
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
		const {confirmLoading} = this.state;
		const {visible, form, intl, documentation} = this.props;
		const {getFieldDecorator, getFieldValue} = form;

		return (
			<div className={`${visible ? 'd-block' : 'd-none'}`}>
				<div className="text-center mb-4">
					<h1>
						<FormattedMessage
							defaultMessage="Administrator"
							id="installer.administrator"/>
					</h1>
				</div>
				<Row>
					<Col xl={16} className="mb-3">
						<Form onSubmit={this.handleSubmit}
						      wrapperCol={{xs : 24, sm : 16}}
						      labelCol={{xs : 24, sm : 8}}>
							<Form.Item labelAlign="left"
							           label={
								           <FormattedMessage
									           defaultMessage="Email"
									           id="installer.email"/>
							           }>
								{getFieldDecorator('email', {
									rules : [
										{required : true, type : 'email'},
									],
								})(
									<Input prefix={<Icon type="mail"/>}
									       placeholder={intl.formatMessage(messages.email)}
									       id="user-email"/>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label={
								           <FormattedMessage
									           defaultMessage="Username"
									           id="installer.username"/>
							           }>
								{getFieldDecorator('name', {
									rules : [
										{
											required : true,
											pattern  : /^[A-z0-9_\-.]{3,16}$/,
											message  : intl.formatMessage(messages.invalidUsername)
										},
									],
								})(
									<Input prefix={<Icon type="user"/>}
									       placeholder={intl.formatMessage(messages.username)}/>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label={
								           <FormattedMessage
									           defaultMessage="Password"
									           id="installer.password"/>
							           }>
								{getFieldDecorator('password', {
									rules : [
										{required : true}
									],
								})(
									<Input.Password placeholder={intl.formatMessage(messages.password)}
									                prefix={<Icon type="lock"/>}/>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label={
								           <FormattedMessage
									           defaultMessage="Verify Password"
									           id="installer.verify_password"/>
							           }>
								{getFieldDecorator('password_confirmation', {
									rules : [
										{required : true}
									],
								})(
									<Input.Password placeholder={intl.formatMessage(messages.verifyPassword)}
									                prefix={<Icon type="lock"/>}/>
								)}
							</Form.Item>

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
											defaultMessage="Register"
											id="installer.register"/>
									</span>
								</Button>
							</Form.Item>
						</Form>
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
										"Database migration and seeds will be executed at this stage, " +
										"however this may fail if any of your database environment values in " +
										"the previous step is incorrect."
									}
									id="installer.administrator_information"/>
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
	formHelper()
)(Administrator);