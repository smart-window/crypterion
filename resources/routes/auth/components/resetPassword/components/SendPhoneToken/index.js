import React, {Component} from 'react';
import {Button, Form} from "antd";
import PhoneInput from "components/PhoneInput";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService from "support/Services/Api";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {assign, isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import ReCaptcha from "containers/components/ReCaptcha";
import {connect} from "react-redux";


const messages = defineMessages({
	invalidPhone : {
		defaultMessage : "You phone is invalid.",
		id             : "reset_password.invalid_phone"
	},

	successful : {
		defaultMessage : "Your action was successful.",
		id             : "reset_password.send_action_successful"
	},
});

class SendPhoneToken extends Component {
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
		const endpoint = route('auth.reset-password.send-phone-token');

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
						this.triggerSent(data.phone)
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, data, () => {
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

		const component = this;

		return (
			<Form onSubmit={this.handleSubmit}>
				<Form.Item className="mt-3">
					{getFieldDecorator('phone', {
						rules : [
							{required : true},
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
						<PhoneInput
							itl={itl => component.itl = itl}/>
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
	injectIntl,
)(SendPhoneToken);