import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import {Button, Divider, Form, Input} from "antd";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import formHelper from "support/Helpers/Form";
import ApiService from "support/Services/Api";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {isEmpty} from "lodash";

const messages = defineMessages({
	password : {
		defaultMessage : "Enter your password...",
		id             : "profile.input_password_placeholder"
	},

	newPassword : {
		defaultMessage : "Enter a new password...",
		id             : "profile.input_new_password_placeholder"
	},

	newPasswordConfirmation : {
		defaultMessage : "Confirm your new password...",
		id             : "profile.input_new_password_confirmation_placeholder"
	},
	successful              : {
		defaultMessage : "Your password was updated successfully!",
		id             : "profile.password_action_successful"
	},
});

class Password extends Component {
	constructor(props) {
		super(props);

		this.state = {
			confirmLoading : false
		};

		this.api = new ApiService();
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.change-password', {
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
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Change Password"
						id="profile.change_password"/>
				}>
				<Form onSubmit={this.handleSubmit}>
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Current Password"
							           id="profile.current_password"/>
					           }>
						{getFieldDecorator('password', {
							rules : [
								{required : true},
							],
						})(
							<Input.Password placeholder={intl.formatMessage(messages.password)}/>
						)}
					</Form.Item>

					<Divider>
						<FormattedMessage
							defaultMessage="New Password"
							id="profile.new_password"/>
					</Divider>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="New Password"
							           id="profile.new_password"/>
					           }>
						{getFieldDecorator('new_password', {
							rules : [
								{required : true},
							],
						})(
							<Input.Password placeholder={intl.formatMessage(messages.newPassword)}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Confirm New Password"
							           id="profile.confirm_new_password"/>
					           }>
						{getFieldDecorator('new_password_confirmation', {
							rules : [
								{required : true},
							],
						})(
							<Input.Password placeholder={intl.formatMessage(messages.newPasswordConfirmation)}/>
						)}
					</Form.Item>

					<div className="mt-5">
						<Button type="danger" block htmlType="submit"
						        loading={confirmLoading}>
							<span>
								<FormattedMessage
									defaultMessage="Change Password"
									id="profile.change_password"/>
							</span>
						</Button>
					</div>
				</Form>
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
		mapStateToProps
	),
	formHelper(),
)(Password);