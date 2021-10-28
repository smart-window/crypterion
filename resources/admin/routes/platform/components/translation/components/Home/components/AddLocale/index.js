import React, {Component} from 'react';
import {Button, Col, Form, Input, Row} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import ApiService from "admin/support/Services/Api";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";

const messages = defineMessages({
	locale : {
		defaultMessage : "Enter a valid locale ISO-2 code...",
		id             : "admin.translation.input_locale_code_placeholder"
	},

	successful : {
		defaultMessage : "Locale added successfully.",
		id             : "admin.translation.locale_added_successfully"
	},
});

class AddLocale extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {axios, route} = this.api;
		const endpoint = route('admin.platform.translation.add-locale');
		const {form, intl} = this.props;

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

	triggerSuccess() {
		const {onSuccess} = this.props;
		if (typeof onSuccess === "function") {
			return onSuccess();
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {confirmLoading} = this.state;
		const {intl, form} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Form onSubmit={this.handleSubmit}>
				<Row gutter={8}>
					<Col span={16}>
						<Form.Item>
							{getFieldDecorator('locale', {
								rules : [{required : true}],
							})(
								<Input placeholder={intl.formatMessage(messages.locale)}/>
							)}
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item>
							<Button type="default" icon="plus"
							        htmlType="submit" shape="round"
							        loading={confirmLoading}>
								<span>
									<FormattedMessage
										defaultMessage="Add"
										id="admin.translation.add"/>
								</span>
							</Button>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		);
	}
}

export default pipe(
	formHelper(),
)(AddLocale);