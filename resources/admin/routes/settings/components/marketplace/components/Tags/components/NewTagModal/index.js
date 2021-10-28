import React, {Component} from 'react';
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import ApiService from "admin/support/Services/Api";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import {defineMessages, FormattedMessage} from "react-intl";
import {Form, Input, Modal} from "antd";

const messages = defineMessages({
	successful : {
		defaultMessage : "A new marketplace tag was created successfully.",
		id             : "admin.marketplace.create_marketplace_tag_successful"
	},
});

class NewTagModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.settings.marketplace.tags.create');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.triggerSuccess(data);
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
					       defaultMessage="Create Marketplace Tags"
					       id="admin.marketplace.create_marketplace_tags"/>
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
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(NewTagModal);