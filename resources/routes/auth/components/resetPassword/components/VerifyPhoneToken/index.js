import React, {Component} from 'react';
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {defineMessages, FormattedMessage} from "react-intl";
import {Button, Form, Input} from "antd";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import ApiService from "support/Services/Api";

const messages = defineMessages({
	successful : {
		defaultMessage : "Your action was successful.",
		id             : "reset_password.verification_action_successful"
	},
});

class VerifyPhoneToken extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	triggerVerified(nonce) {
		const {onVerified} = this.props;
		if (typeof onVerified === "function") {
			return onVerified(nonce);
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, target} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('auth.reset-password.verify-phone-token');

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const requestData = {...values, phone: target};

				axios.post(endpoint.url(), requestData)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.triggerVerified(data.token)
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, requestData, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	render() {
		const {intl, form} = this.props;
		const {confirmLoading} = this.state;
		const {getFieldDecorator} = form;

		return (
			<Form onSubmit={this.handleSubmit}>
				<Form.Item className="mt-3">
					{getFieldDecorator('token', {
						rules : [
							{required : true},
						]
					})(
						<Input/>
					)}
				</Form.Item>

				<Button loading={confirmLoading}
				        type="primary" htmlType="submit">
					<span>
						<FormattedMessage
							defaultMessage="Verify Code"
							id="common.verify_code"/>
					</span>
				</Button>
			</Form>
		);
	}
}

export default pipe(
	formHelper(),
)(VerifyPhoneToken);