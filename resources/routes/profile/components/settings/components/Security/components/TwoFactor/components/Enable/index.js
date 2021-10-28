import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import formHelper from "support/Helpers/Form";
import {Button, Col, Form, Input, Row} from "antd";
import QRCode from "qrcode.react";
import ApiService from "support/Services/Api";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {isEmpty} from "lodash";

const messages = defineMessages({
	twoFactorCode : {
		defaultMessage : "Enter two factor code...",
		id             : "profile.input_two_factor_code_placeholder"
	},
	successful    : {
		defaultMessage : "Two Factor was enabled successfully.",
		id             : "profile.two_factor_enable_action_successful"
	},
});

class Enable extends Component {
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

		const endpoint = route('user.profile.two-factor-enable', {
			name : user.name
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.triggerSuccess()
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess = () => {
		const {onSuccess} = this.props;
		if (typeof onSuccess === "function") {
			return onSuccess();
		}
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {confirmLoading} = this.state;
		const {intl, secret, url, form, twoFactorEnabled} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Row gutter={8}>
				<Col sm={12} className="mb-3">
					<div className="text-center">
						<QRCode value={url}
						        className="img-thumbnail"
						        size={150}/>
					</div>
				</Col>
				<Col sm={12} className="mb-3">
					<div className="mb-2">
						<span>
							<FormattedMessage
								defaultMessage="Scan the QR code with {google} or {authy} Mobile App."
								values={{
									authy  : <b>Authy</b>,
									google : <b>Google Authenticator</b>
								}}
								id="profile.two_factor_setup_info"/>
						</span>
					</div>

					<Form onSubmit={this.handleSubmit}>
						{!twoFactorEnabled ? (
							<React.Fragment>
								<div className="my-3">
									<FormattedMessage
										defaultMessage="SECRET: {secret}"
										id="profile.security.display_secret"
										values={{
											secret : <b>{secret}</b>
										}}/>
								</div>

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

								<div className="mt-2">
									<Button type="primary" block
									        icon="poweroff" htmlType="submit"
									        loading={confirmLoading}>
										<span>
											<FormattedMessage
												defaultMessage="Enable"
												id="profile.enable"/>
										</span>
									</Button>
								</div>
							</React.Fragment>
						) : (
							<React.Fragment>
								<div className="my-3">
									<FormattedMessage
										defaultMessage="SECRET: {secret}"
										id="profile.security.display_secret"
										values={{
											secret : <b>{secret}</b>
										}}/>
								</div>

								<Button type="primary"
								        onClick={this.onSuccess} className="mt-4"
								        icon="check" block>
									<span>
										<FormattedMessage
											defaultMessage="Confirm"
											id="profile.confirm"/>
									</span>
								</Button>
							</React.Fragment>
						)}
					</Form>
				</Col>
			</Row>
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
)(Enable);