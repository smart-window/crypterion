import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import {Form, Input, Modal} from "antd";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";

const messages = defineMessages({
	successful : {
		defaultMessage : "Marketplace tag was updated successfully.",
		id             : "admin.marketplace.update_marketplace_tag_successful"
	},
});

class EditTagModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = () => {
		const {form, intl} = this.props;
		const {axios, route} = this.api;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('admin.settings.marketplace.tags.update', {
					tag : values.id
				});

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
		const {visible, onCancel, form} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Edit Marketplace Tag"
					       id="admin.marketplace.edit_marketplace_tag"/>
			       }
			       className="cp-modal-sm"
			       onCancel={onCancel}
			       onOk={this.handleSubmit}
			       okText={
				       <span>
					       <FormattedMessage
						       defaultMessage="Submit"
						       id="common.submit"/>
				       </span>
			       }>
				<Form.Item labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Name"
						           id="admin.marketplace.name"/>
				           }>
					{getFieldDecorator("name", {
						rules : [{required : true}],
					})(<Input/>)}
				</Form.Item>

				<Form.Item labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Description"
						           id="admin.marketplace.description"/>
				           }>
					{getFieldDecorator("description", {
						rules : [{required : true}],
					})(<Input.TextArea/>)}
				</Form.Item>

				<Form.Item className="d-none">
					{getFieldDecorator("id", {
						rules : [{required : true}],
					})(<Input/>)}
				</Form.Item>
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(EditTagModal);