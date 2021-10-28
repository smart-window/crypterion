import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import {defineMessages, FormattedMessage} from "react-intl";
import {Form, Input, Modal} from "antd";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";

const messages = defineMessages({
	successful : {
		defaultMessage : "Translation key saved.",
		id             : "admin.translation.translation_key_saved"
	},
});

class EditKeyModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = (e) => {
		const {form, intl, group} = this.props;
		const {axios, route} = this.api;

		const endpoint = route('admin.platform.translation.group-update', {
			group : group
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.triggerSuccess(data)
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess(data) {
		const {onSuccess} = this.props;
		if (typeof onSuccess === "function") {
			return onSuccess(data);
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {confirmLoading} = this.state;
		const {visible, onCancel, form, locales} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Edit Key"
					       id="admin.translation.edit_key"/>
			       }
			       onCancel={onCancel}
			       onOk={this.handleSubmit}
			       okText={
				       <span>
					       <FormattedMessage
						       defaultMessage="Submit"
						       id="common.submit"/>
				       </span>
			       }>
				<Form.Item labelCol={{xs : 8}}
				           wrapperCol={{xs : 16}}
				           labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Key"
						           id="admin.translation.key"/>
				           }>
					{getFieldDecorator("key")(
						<Input disabled={true}/>
					)}
				</Form.Item>

				{locales.map((locale) => (
					<Form.Item key={locale}
					           labelCol={{xs : 8}}
					           wrapperCol={{xs : 16}}
					           labelAlign="left"
					           label={locale}>
						{getFieldDecorator(locale, {
							rules : [{required : true}],
						})(<Input/>)}
					</Form.Item>
				))}
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(EditKeyModal);