import React, {Component} from 'react';
import {Button, Form, Input} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {isEmpty} from "lodash";

const messages = defineMessages({
	twoFactorCode : {
		defaultMessage : "Enter your Two Factor code.",
		id             : "marketplace.input_two_factor_code_placeholder"
	},
	password      : {
		defaultMessage : "Enter your Password.",
		id             : "marketplace.input_password_placeholder"
	},
});

class VerificationForm extends Component {
	cancel = () => {
		const {onCancel} = this.props;
		if (typeof onCancel === "function") {
			return onCancel();
		}
	};

	submit = () => {
		const {form, onSubmit} = this.props;
		form.validateFields((errors, values) => {
			if (isEmpty(errors) && typeof onSubmit === "function") {
				return onSubmit(values.code)
			}
		});
	};

	render() {
		const {withTwoFactor, intl} = this.props;
		const {getFieldDecorator} = this.props.form;

		return (
			<div className="p-2 text-left">
				<Form>
					{withTwoFactor ? (
						<Form.Item labelAlign="left"
						           label={
							           <FormattedMessage
								           defaultMessage="Token"
								           id="marketplace.token"/>
						           }>
							{getFieldDecorator('code', {
								rules : [
									{required : true},
								],
							})(
								<Input placeholder={intl.formatMessage(messages.twoFactorCode)}/>
							)}
						</Form.Item>
					) : (
						<Form.Item labelAlign="left"
						           label={
							           <FormattedMessage
								           defaultMessage="Password"
								           id="marketplace.password"/>
						           }>
							{getFieldDecorator('code', {
								rules : [
									{required : true},
								],
							})(
								<Input.Password placeholder={intl.formatMessage(messages.password)}/>
							)}
						</Form.Item>
					)}

					<Form.Item className="mt-2">
						<Button type="primary" block
						        onClick={this.submit}
						        className="mb-0">
							<span>
								<FormattedMessage
									defaultMessage="Approve Trade"
									id="marketplace.approve_trade"/>
							</span>
						</Button>
						<Button type="dashed" block
						        onClick={this.cancel}>
							<span>
								<FormattedMessage
									defaultMessage="Cancel"
									id="marketplace.cancel"/>
							</span>
						</Button>
					</Form.Item>
				</Form>
			</div>
		);
	}
}

export default pipe(
	formHelper(),
)(VerificationForm);