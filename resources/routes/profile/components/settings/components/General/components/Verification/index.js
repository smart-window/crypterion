import React, {Component} from 'react';
import {pipe} from "support/utils/common";
import Auth from "support/Auth";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import {Button, Col, Form, Icon, Input, message as messageApi, Row, Tag} from "antd";
import formHelper from "support/Helpers/Form";
import PhoneInput from "components/PhoneInput";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "support/utils/promise";
import ApiService from "support/Services/Api";
import {assign, isEmpty} from "lodash";

const messages = defineMessages({
	invalidPhone : {
		defaultMessage : "You phone is invalid!",
		id             : "profile.invalid_phone"
	},

	emailCodePlaceholder : {
		defaultMessage : "Enter the code sent to your email...",
		id             : "profile.verification_email_code_placeholder"
	},

	phoneCodePlaceholder : {
		defaultMessage : "Enter the code sent to your phone...",
		id             : "profile.verification_phone_code_placeholder"
	},

	tokenRequired : {
		defaultMessage : "Token is required to complete verification!",
		id             : "profile.token_required"
	},

	successful : {
		defaultMessage : "Your action was successful.",
		id             : "profile.verification_action_successful"
	},
});

class Verification extends Component {
	constructor(props) {
		super(props);

		this.state = {
			canEditEmail       : !props.user.email,
			canEditPhone       : !props.user.phone,
			emailToken         : "",
			phoneToken         : "",
			phoneVerifyLoading : false,
			emailVerifyLoading : false,
			confirmLoading     : false,

		};

		this.api = new ApiService();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const user = this.props.user;

		if (prevProps.user.email !== user.email) {
			console.log('User Email Updated');
			this.setState({
				canEditEmail : !user.email
			})
		}

		if (prevProps.user.phone !== user.phone) {
			console.log('User Phone Updated');
			this.setState({
				canEditPhone : !user.phone
			})
		}
	}

	resendEmailToken = () => {
		const {intl, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.resend-email-token', {
			name : user.name
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(
				response, null, intl.formatMessage(messages.successful)
			))
			.catch(error => handleError(error));
	};

	verifyEmailToken = () => {
		const {intl, user} = this.props;
		const {axios, route} = this.api;
		const {emailToken} = this.state;

		if (!emailToken) {
			return messageApi.error(intl.formatMessage(messages.tokenRequired));
		}

		const endpoint = route('user.profile.verify-email-token', {
			name : user.name
		});

		axios.post(endpoint.url(), {token : emailToken})
			.then(response => handleSuccess(response, () => {
				this.setState({emailToken : ""});
				this.setState({emailVerifyLoading : false});
				this.change();
			}, intl.formatMessage(messages.successful)))
			.catch(error => handleError(error, () => {
				this.setState({emailToken : ""});
				this.setState({emailVerifyLoading : false});
			}));

		this.setState({emailVerifyLoading : true});
	};

	onChangeEmailToken = (e) => {
		this.setState({emailToken : e.target.value})
	};

	resendPhoneToken = () => {
		const {intl, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.resend-phone-token', {
			name : user.name
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(
				response, null, intl.formatMessage(messages.successful)
			))
			.catch(error => handleError(error));
	};

	verifyPhoneToken = () => {
		const {intl, user} = this.props;
		const {axios, route} = this.api;
		const {phoneToken} = this.state;

		if (!phoneToken) {
			return messageApi.error(intl.formatMessage(messages.tokenRequired))
		}

		const endpoint = route('user.profile.verify-phone-token', {
			name : user.name
		});

		axios.post(endpoint.url(), {token : phoneToken})
			.then(response => handleSuccess(response, () => {
				this.setState({phoneToken : ""});
				this.setState({phoneVerifyLoading : false});
				this.change()
			}, intl.formatMessage(messages.successful)))
			.catch(error => handleError(error, () => {
				this.setState({phoneToken : ""});
				this.setState({phoneVerifyLoading : false});
			}));

		this.setState({phoneVerifyLoading : true});
	};

	onChangePhoneToken = (e) => {
		this.setState({phoneToken : e.target.value})
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.update-verification', {
			name : user.name
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				let data = assign({}, values);

				if (this.itl) {
					const countryData = this.itl.getSelectedCountryData();
					data['phone_country'] = countryData.iso2;
				}

				axios.post(endpoint.url(), data)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.change()
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, data, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	change(){
		const {onUserChange} = this.props;
		if (typeof onUserChange === "function") {
			return onUserChange();
		}
	}

	editEmail = () => {
		this.setState({canEditEmail : true})
	};

	editPhone = () => {
		this.setState({canEditPhone : true})
	};

	render() {
		const {intl, user} = this.props;

		const {
			canEditEmail, canEditPhone, confirmLoading,
			emailToken, phoneToken, phoneVerifyLoading,
			emailVerifyLoading
		} = this.state;

		const {getFieldDecorator} = this.props.form;
		const component = this;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Basic Verification"
						id="profile.basic_verification"/>
				}>
				<Form onSubmit={this.handleSubmit}>
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Phone"
							           id="profile.phone"/>
					           }
					           extra={(user.phone || !canEditPhone) && (
						           <div className="d-flex align-items-center justify-content-between">
							           {user.phone && !user.phone_verified_at && (
								           <span>
									           <Tag color="red" className="m-0 mr-2">
										           <FormattedMessage
											           defaultMessage="Unverified"
											           id="common.unverified"/>
									           </Tag>
									           <a onClick={this.resendPhoneToken}>
										           <FormattedMessage
											           defaultMessage="Resend Code"
											           id="profile.resend_code"/>
									           </a>
								           </span>
							           )}

							           {user.phone && user.phone_verified_at && (
								           <span>
									           <Tag color="green" className="m-0 mr-2">
										           <FormattedMessage
											           defaultMessage="Verified"
											           id="common.verified"/>
									           </Tag>
								           </span>
							           )}

							           {!canEditPhone && (
								           <a onClick={this.editPhone} className="ml-auto">
									           <Icon type="edit"/>
								           </a>
							           )}
						           </div>
					           )}>
						{getFieldDecorator('phone', {
							initialValue : user.phone,
							rules        : [
								{
									validator : function (rule, value, callback) {
										if (component.itl && !component.itl.isValidNumber() && value) {
											callback(intl.formatMessage(messages.invalidPhone));
										}
										callback()
									}
								}
							]
						})(
							<PhoneInput itl={itl => component.itl = itl}
							            disabled={!canEditPhone}/>
						)}
					</Form.Item>


					{user.phone && !user.phone_verified_at && (
						<div className="mb-4">
							<Row gutter={8}>
								<Col span={16}>
									<Input
										onChange={this.onChangePhoneToken}
										placeholder={intl.formatMessage(messages.phoneCodePlaceholder)}
										value={phoneToken}/>
								</Col>
								<Col span={8}>
									<Button type="default"
									        onClick={this.verifyPhoneToken}
									        loading={phoneVerifyLoading}>
										<span>
											<FormattedMessage
												defaultMessage="Verify"
												id="common.verify"/>
										</span>
									</Button>
								</Col>
							</Row>
						</div>
					)}

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Email"
							           id="profile.email"/>
					           }
					           extra={(user.email || !canEditEmail) && (
						           <div className="d-flex align-items-center justify-content-between">
							           {user.email && !user.email_verified_at && (
								           <span>
									           <Tag color="red" className="m-0 mr-2">
										           <FormattedMessage
											           defaultMessage="Unverified"
											           id="common.unverified"/>
									           </Tag>
									           <a onClick={this.resendEmailToken}>
										           <FormattedMessage
											           defaultMessage="Resend Code"
											           id="profile.resend_code"/>
									           </a>
								           </span>
							           )}

							           {user.email && user.email_verified_at && (
								           <span>
									           <Tag color="green" className="m-0 mr-2">
										           <FormattedMessage
											           defaultMessage="Verified"
											           id="common.verified"/>
									           </Tag>
								           </span>
							           )}

							           {!canEditEmail && (
								           <a onClick={this.editEmail} className="ml-auto">
									          <Icon type="edit"/>
								           </a>
							           )}
						           </div>
					           )}>
						{getFieldDecorator('email', {
							initialValue : user.email,
							rules        : [{type : 'email'}]
						})(
							<Input disabled={!canEditEmail}/>
						)}
					</Form.Item>

					{user.email && !user.email_verified_at && (
						<div className="mb-4">
							<Row gutter={8}>
								<Col span={16}>
									<Input
										onChange={this.onChangeEmailToken}
										placeholder={intl.formatMessage(messages.emailCodePlaceholder)}
										value={emailToken}/>
								</Col>
								<Col span={8}>
									<Button type="default"
									        onClick={this.verifyEmailToken}
									        loading={emailVerifyLoading}>
										<span>
											<FormattedMessage
												defaultMessage="Verify"
												id="common.verify"/>
										</span>
									</Button>
								</Col>
							</Row>
						</div>
					)}

					{(canEditEmail || canEditPhone) && (
						<React.Fragment>
							<Form.Item className="mt-3"
							           labelAlign="left"
							           wrapperCol={{xs : 24, sm : 16}}
							           labelCol={{xs : 24, sm : 8}}
							           label={
								           <FormattedMessage
									           defaultMessage="Password"
									           id="common.password"/>
							           }>
								{getFieldDecorator('current_password', {
									rules : [{required : true}]
								})(
									<Input.Password/>
								)}
							</Form.Item>

							<Form.Item className="d-flex justify-content-end">
								<Button type="primary"
								        loading={confirmLoading}
								        className="ml-auto"
								        htmlType="submit">
									<span>
										<FormattedMessage
											defaultMessage="Submit"
											id="common.submit"/>
									</span>
								</Button>
							</Form.Item>
						</React.Fragment>
					)}
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
	withRouter
)(Verification);