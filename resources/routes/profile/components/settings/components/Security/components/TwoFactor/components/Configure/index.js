import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import formHelper from "support/Helpers/Form";
import {Button, Checkbox, Divider, Form, Input} from "antd";
import ApiService from "support/Services/Api";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {isEmpty} from "lodash";


const messages = defineMessages({
	twoFactorCode : {
		defaultMessage : "Enter two factor code...",
		id             : "profile.input_two_factor_code_placeholder"
	},
	password      : {
		defaultMessage : "Enter your password...",
		id             : "profile.input_password_placeholder"
	},
	successful    : {
		defaultMessage : "Your Two Factor settings was updated successfully!",
		id             : "profile.two_factor_configure_action_successful"
	},
});

class Configure extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, user} = this.props;
		const {axios, route} = this.api;

		const endpoint = route('user.profile.two-factor-configure', {
			name : user.name
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
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

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {intl, user} = this.props;
		const {getFieldDecorator} = this.props.form;
		const {confirmLoading} = this.state;

		return (
			<Form onSubmit={this.handleSubmit}>
				<Divider>
					<FormattedMessage
						defaultMessage="Settings"
						id="profile.two_factor_settings"/>
				</Divider>
				<Form.Item>
					{getFieldDecorator('authentication', {
						valuePropName : 'checked',
						initialValue  : user.two_factor_setting.authentication
					})(
						<Checkbox>
							<FormattedMessage
								defaultMessage="Require for Authentication"
								id="profile.two_factor_authentication"/>
						</Checkbox>
					)}
				</Form.Item>

				<Form.Item>
					{getFieldDecorator('outgoing_transfer', {
						valuePropName : 'checked',
						initialValue  : user.two_factor_setting.outgoing_transfer
					})(
						<Checkbox>
							<FormattedMessage
								defaultMessage="Require for Outgoing Transfer"
								id="profile.two_factor_outgoing_transfer"/>
						</Checkbox>
					)}
				</Form.Item>

				<Form.Item>
					{getFieldDecorator('marketplace', {
						valuePropName : 'checked',
						initialValue  : user.two_factor_setting.marketplace
					})(
						<Checkbox>
							<FormattedMessage
								defaultMessage="Require for Marketplace"
								id="profile.two_factor_marketplace"/>
						</Checkbox>
					)}
				</Form.Item>

				<Divider>
					<FormattedMessage
						defaultMessage="Verify"
						id="profile.two_factor_verify"/>
				</Divider>

				<Form.Item labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Token"
						           id="profile.token"/>
				           }>
					{getFieldDecorator('token', {
						rules : [
							{required : true},
						],
					})(
						<Input placeholder={intl.formatMessage(messages.twoFactorCode)}/>
					)}
				</Form.Item>

				<div className="mt-5">
					<Button type="primary" block
					        icon="save" htmlType="submit"
					        loading={confirmLoading}>
						<span>
							<FormattedMessage
								defaultMessage="Save Settings"
								id="profile.two_factor_save_settings"/>
						</span>
					</Button>
				</div>
			</Form>
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
	formHelper(),
)(Configure);