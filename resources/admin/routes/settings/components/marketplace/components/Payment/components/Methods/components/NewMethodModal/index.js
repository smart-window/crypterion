import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import {defineMessages, FormattedMessage} from "react-intl";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import {Alert, Divider, Form, Input, InputNumber, Modal, Select} from "antd";
import {connect} from "react-redux";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";

const messages = defineMessages({
	successful : {
		defaultMessage : "A new payment method was created successfully.",
		id             : "admin.marketplace.create_payment_method_successful"
	},
});

class NewMethodModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.settings.marketplace.payment.methods.create');
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
		const {visible, onCancel, form, categories, wallets} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Create Payment Method"
					       id="admin.marketplace.create_payment_method"/>
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
					<Form.Item labelAlign="left"
					           wrapperCol={{xs : 12}}
					           labelCol={{xs : 12}}
					           label={wallet.coin.name}
					           key={wallet.coin.id}>
						{getFieldDecorator(wallet.coin.identifier, {
							rules        : [
								{type : 'number', required : true, min : 0, max : 100}
							],
						})(<InputNumber/>)}
					</Form.Item>
				))}
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
)(NewMethodModal);