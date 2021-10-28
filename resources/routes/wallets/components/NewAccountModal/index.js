import React, {Component} from 'react';
import {Form, Modal, Select} from "antd";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import formHelper from "support/Helpers/Form";
import ApiService from "support/Services/Api";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {hideNewAccountForm, showNewAccountForm} from "redux/actions/Wallet"
import {isEmpty} from "lodash";

const messages = defineMessages({
	wallet : {
		defaultMessage : "Select a wallet...",
		id             : "wallet.wallet_select_placeholder"
	},

	successful : {
		defaultMessage : "Your account has been added successfully.",
		id             : "wallet.added_account_successfully"
	},
});

class NewAccountModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
		};
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	hideModal = () => {
		this.props.hideNewAccountForm();
	};

	handleSubmit = () => {
		const {axios, route} = this.api;
		const endpoint = route('wallet.add-account');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.props.hideNewAccountForm();
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

	render() {
		const {confirmLoading} = this.state;
		const {showNewAccountModal, form, intl, wallets} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal className="cp-modal-sm"
			       visible={showNewAccountModal}
			       onCancel={this.hideModal}
			       confirmLoading={confirmLoading}
			       onOk={this.handleSubmit}
			       title={
				       <FormattedMessage
					       defaultMessage="Add Account"
					       id="wallet.add_account"/>
			       }
			       okText={
				       <span>
					       <FormattedMessage
						       defaultMessage="Add"
						       id="common.add"/>
				       </span>
			       }>
				<Form.Item labelCol={{xs : 24, sm : 8}}
				           wrapperCol={{xs : 24, sm : 16}}
				           labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Wallet"
						           id="common.select_wallet"/>
				           }>
					{getFieldDecorator('wallet', {
						rules : [{required : true}],
					})(
						<Select className="w-100"
						        placeholder={intl.formatMessage(messages.wallet)}>
							{wallets.map((wallet) => (
								<Select.Option key={wallet.id} value={wallet.id}>
									{wallet.coin.name}
								</Select.Option>
							))}
						</Select>
					)}
				</Form.Item>
			</Modal>
		);
	}
}

const mapStateToProps = ({
	wallet      : {
		showNewAccountModal
	},
	collections : {
		wallets,
	},
}) => ({
	showNewAccountModal,
	wallets
});

export default pipe(
	connect(
		mapStateToProps,
		{
			showNewAccountForm,
			hideNewAccountForm
		}
	),
	formHelper(),
)(NewAccountModal);
