import React, {Component} from 'react';
import {Button, Form, Input} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "support/Services/Api";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import ReCaptcha from "containers/components/ReCaptcha";
import {connect} from "react-redux";


const messages = defineMessages({
	successful : {
		defaultMessage : "Your action was successful.",
		id             : "reset_password.send_action_successful"
	},
});

class SendEmailToken extends Component {
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

	triggerSent(target) {
		const {onSent} = this.props;
		if (typeof onSent === "function") {
			return onSent(target);
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('auth.reset-password.send-email-token');

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.triggerSent(values.email)
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	render() {
		const {intl, form, recaptcha} = this.props;
		const {getFieldDecorator, getFieldError} = form;
		const {confirmLoading} = this.state;

		return (
			<Form onSubmit={this.handleSubmit}>
				<Form.Item className="mt-3">
					{getFieldDecorator('email', {
						rules : [
							{required : true},
							{type : 'email'}
						]
					})(
						<Input/>
					)}
				</Form.Item>

				{recaptcha.enable && (
					<Form.Item>
						{getFieldDecorator('recaptcha', {
							rules : [
								{required : true}
							],
						})(
							<ReCaptcha errors={getFieldError('recaptcha')}
							           settings={recaptcha}/>
						)}
					</Form.Item>
				)}

				<Button loading={confirmLoading}
				        type="primary" htmlType="submit">
					<span>
						<FormattedMessage
							defaultMessage="Send Code"
							id="common.send_code"/>
					</span>
				</Button>
			</Form>
		);
	}
}

const mapStateToProps = ({
	settings : {
		recaptcha
	},
}) => ({
	recaptcha
});

export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
)(SendEmailToken);