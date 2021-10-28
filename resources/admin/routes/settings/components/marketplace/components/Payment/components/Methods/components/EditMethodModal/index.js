import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {Alert, Divider, Form, Input, InputNumber, Modal, Select} from "antd";
import {pipe} from "admin/support/utils/common";
import {connect} from "react-redux";
import formHelper from "admin/support/Helpers/Form";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";

const messages = defineMessages({
	successful : {
		defaultMessage : "Payment method was updated successfully.",
		id             : "admin.marketplace.update_payment_method_successful"
	},
});

class EditMethodModal extends Component {
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
				const endpoint = route('admin.settings.marketplace.payment.methods.update', {
					method : values.id
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
		const {visible, onCancel, form, categories, wallets} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Edit Payment Method"
					       id="admin.marketplace.edit_payment_method"/>
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

				<Form.Item labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Category"
						           id="admin.marketplace.category"/>
				           }>
					{getFieldDecorator("category", {
						rules : [{required : true}],
					})(
						<Select className="w-100">
							{categories.map((category) => {
								return (
									<Select.Option key={category.id} value={category.id}>
										{category.name}
									</Select.Option>
								)
							})}
						</Select>
					)}
				</Form.Item>

				<Divider>
					<FormattedMessage
						defaultMessage="Marketplace Fees"
						id="admin.marketplace.marketplace_fees"/>
				</Divider>

				<div className="my-3">
					<Alert type="info"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "Marketplace fees are in percentages."
							       }
							       id="admin.marketplace.fees_info"/>
					       }
					       showIcon/>
				</div>

				{wallets.map((wallet) => (
					<Form.Item labelCol={{xs : 12}}
					           wrapperCol={{xs : 12}}
					           labelAlign="left"
					           label={wallet.coin.name}
					           key={wallet.coin.id}>
						{getFieldDecorator(wallet.coin.identifier, {
							rules : [
								{type : 'number', required : true, min : 0, max : 100}
							],
						})(<InputNumber/>)}
					</Form.Item>
				))}

				<Form.Item className="d-none">
					{getFieldDecorator("id", {
						rules : [{required : true}],
					})(<Input/>)}
				</Form.Item>
			</Modal>
		);
	}
}

const mapStateToProps = ({
	collections : {
		wallets,
	},
}) => ({
	wallets
});

export default pipe(
	connect(
		mapStateToProps,
	),
	formHelper(),
)(EditMethodModal);