import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {isEmpty} from "lodash";
import {pipe} from "admin/support/utils/common";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import {Alert, Divider, Form, InputNumber, Modal, Select} from "antd";
import formHelper from "admin/support/Helpers/Form";

const messages = defineMessages({
	successful : {
		defaultMessage : "Wallet was added successfully.",
		id             : "admin.wallets.add_wallet_successful"
	},
});

class NewWalletModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.wallets.add');
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
		const {visible, onCancel, form, adapters} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Add Wallet"
					       id="admin.wallets.add_wallet"/>
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
						           defaultMessage="Adapters"
						           id="admin.wallets.adapters"/>
				           }>
					{getFieldDecorator("adapter", {
						rules : [{required : true}],
					})(
						<Select className="w-100">
							{adapters.map((adapter) => {
								return (
									<Select.Option key={adapter.identifier} value={adapter.class}>
										{adapter.name}
									</Select.Option>
								)
							})}
						</Select>
					)}
				</Form.Item>

				<Divider>
					<FormattedMessage
						defaultMessage="Attributes"
						id="common.attributes"/>
				</Divider>

				<div className="my-3">
					<Alert type="warning"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "You may not be able to edit these attributes " +
								       "after adding this wallet. Tread carefully!"
							       }
							       id="admin.wallets.wallet_attributes_warning"/>
					       }
					       showIcon/>
				</div>

				<Form.Item labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Min Confirmations"
						           id="admin.wallets.min_confirmations"/>
				           }>
					{getFieldDecorator("min_confirmations", {
						rules : [
							{type : 'number', required : true, min : 1, max : 6}
						],
					})(
						<InputNumber className="w-100"/>
					)}
				</Form.Item>
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(NewWalletModal);