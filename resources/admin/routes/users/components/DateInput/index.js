import React, {Component} from 'react';
import {DatePicker, message as messageApi, Modal} from "antd";
import {defineMessages, injectIntl} from "react-intl";
import moment from "moment/moment";
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
		defaultMessage : "Please enter a valid date.",
		id             : "admin.users.invalid_date_input_message"
	},
	placeholder  : {
		defaultMessage : "Choose date...",
		id             : "admin.users.date_input_placeholder"
	},
});

class DateInputModal extends Component {
	constructor(props) {
		super(props);

		const defaultValue = props.defaultValue ?
			moment(props.defaultValue) : moment();

		this.state = {
			value : defaultValue
		}
	}

	ok = () => {
		const {onOk, intl} = this.props;
		const {value} = this.state;

		if (!moment(value).isValid()) {
			return messageApi.error(intl.formatMessage(messages.invalidInput));
		} else {
			this.resetValue();
		}

		if (typeof onOk === "function") {
			return onOk(value);
		}
	};

	resetValue() {
		if (this.props.resetOnClose) {
			this.setState({value : moment()})
		}
	}

	cancel = () => {
		const {onCancel} = this.props;
		this.resetValue();

		if (typeof onCancel === "function") {
			return onCancel();
		}
	};

	handleChange = (value) => {
		this.setState({value})
	};

	render() {
		const {value} = this.state;
		const {visible, title, intl} = this.props;

		return (
			<Modal className="cp-modal-sm"
			       title={title}
			       cancelText={intl.formatMessage(messages.cancelText)}
			       okText={intl.formatMessage(messages.okText)}
			       destroyOnClose={true}
			       onOk={this.ok}
			       onCancel={this.cancel}
			       visible={visible}>
				<DatePicker style={{width : '100%'}}
				            placeholder={intl.formatMessage(messages.placeholder)}
				            value={value}
				            onChange={this.handleChange}/>
			</Modal>
		);
	}
}

DateInputModal.defaultProps = {
	resetOnClose : true,
}

export default pipe(
	injectIntl
)(DateInputModal);