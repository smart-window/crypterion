import React, {Component} from 'react';
import {pipe} from "admin/support/utils/common";
import {defineMessages, FormattedMessage} from "react-intl";
import {Form, Input, Modal} from "antd";
import formHelper from "admin/support/Helpers/Form";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import ApiService from "admin/support/Services/Api";

const messages = defineMessages({
	successful : {
		defaultMessage : "A new client has been created successfully.",
		id             : "admin.integration.oauth_create_account_successful"
	},
});

class NewClientModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.integration.oauth.client-create');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.triggerSuccess();
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
		const {visible, onCancel, form} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal className="cp-modal-sm"
			       title={
				       <FormattedMessage
					       defaultMessage="Create New Client"
					       id="admin.integration.oauth_create_new_client"/>
			       }
			       visible={visible}
			       confirmLoading={confirmLoading}
			       onCancel={onCancel}
			       onOk={this.handleSubmit}
			       okText={
				       <span>
					       <FormattedMessage
						       defaultMessage="Create"
						       id="common.create"/>
				       </span>
			       }>
				<Form.Item labelCol={{xs : 8}}
				           wrapperCol={{xs : 16}}
				           labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Name"
						           id="common.name"/>
				           }>
					{getFieldDecorator('name', {
						rules : [{required : true}],
					})(<Input/>)}
				</Form.Item>
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(NewClientModal);