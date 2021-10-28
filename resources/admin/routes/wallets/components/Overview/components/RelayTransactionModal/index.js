import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {isEmpty} from "lodash";
import {pipe} from "admin/support/utils/common";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import {Alert, Form, Input, Modal} from "antd";
import formHelper from "admin/support/Helpers/Form";

const messages = defineMessages({
	successful : {
		defaultMessage : "Transaction was relayed successfully.",
		id             : "admin.wallets.transaction_relayed_successful"
	},
});

class RelayTransactionModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			identifier     : null,
			visible        : false,
			confirmLoading : false,
		}
	}

	show(identifier) {
		this.setState({identifier, visible : true})
	}

	handleSubmit = () => {
		const {axios, route} = this.api;
		const {identifier} = this.state;
		const {form, intl} = this.props;
		const endpoint = route('admin.wallets.relay-transaction', {
			identifier : identifier
		});

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false, visible : false});
						this.triggerSuccess(data);
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	handleCancel = () => {
		this.setState({visible : false});
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
		const {getFieldDecorator} = this.props.form;
		const {confirmLoading, visible} = this.state;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Relay Transaction"
					       id="admin.wallets.relay_transaction"/>
			       }
			       className="cp-modal-sm"
			       onCancel={this.handleCancel}
			       onOk={this.handleSubmit}
			       okText={
				       <span>
					       <FormattedMessage
						       defaultMessage="Submit"
						       id="common.submit"/>
				       </span>
			       }>
				<div className="my-3">
					<Alert type="warning"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "Enter the transaction hash of an incoming transaction that want to relay."
							       }
							       id="admin.wallets.relay_transaction_info"/>
					       }
					       showIcon/>
				</div>

				<Form.Item labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Hash"
						           id="admin.wallets.hash"/>
				           }>
					{getFieldDecorator("hash", {
						rules : [
							{required : true}
						],
					})(<Input/>)}
				</Form.Item>
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(RelayTransactionModal);