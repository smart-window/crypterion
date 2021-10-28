import React, {Component} from 'react';
import {Modal, Select} from "antd";
import {defineMessages, injectIntl} from "react-intl";
import {pipe} from "admin/support/utils/common";

const messages = defineMessages({
	cancelText   : {
		defaultMessage : "Cancel",
		id             : "common.cancel"
	},
	okText       : {
		defaultMessage : "Submit",
		id             : "common.submit"
	},
	invalidInput : {
		defaultMessage : "Please select at least one user role.",
		id             : "admin.users.invalid_role_select_message"
	},
	placeholder  : {
		defaultMessage : "Select roles...",
		id             : "admin.users.role_select_placeholder"
	},
});

class RoleSelectModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value : props.defaultValue || []
		}
	}

	ok = () => {
		const {onOk} = this.props;
		const {value} = this.state;

		// if (!Array.isArray(value) || value.length < 1) {
		// 	return messageApi.error(intl.formatMessage(messages.invalidInput));
		// }

		this.resetValue();

		if (typeof onOk === "function") {
			return onOk(value);
		}
	};

	cancel = () => {
		const {onCancel} = this.props;
		this.resetValue();

		if (typeof onCancel === "function") {
			return onCancel();
		}
	};

	resetValue() {
		if (this.props.resetOnClose) {
			this.setState({value : []})
		}
	}

	handleChange = (value) => {
		this.setState({value})
	};

	render() {
		const {value} = this.state;
		const {visible, title, intl, options} = this.props;

		return (
			<Modal className="cp-modal-sm"
			       title={title}
			       cancelText={intl.formatMessage(messages.cancelText)}
			       okText={intl.formatMessage(messages.okText)}
			       destroyOnClose={true}
			       onOk={this.ok}
			       onCancel={this.cancel}
			       visible={visible}>
				<Select style={{width : '100%'}}
				        placeholder={intl.formatMessage(messages.placeholder)}
				        value={value}
				        children={options}
				        onChange={this.handleChange}
				        mode="multiple"/>
			</Modal>
		);
	}
}

RoleSelectModal.defaultProps = {
	resetOnClose : true,
};

export default pipe(
	injectIntl
)(RoleSelectModal);