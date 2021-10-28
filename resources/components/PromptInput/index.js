import React, {Component} from 'react';
import {DatePicker, Input, Modal, Select} from "antd";
import {FormattedMessage} from "react-intl";

class PromptInput extends Component {
	constructor(props) {
		super(props);

		const {defaultEntryValue} = this.props;

		this.state = {
			value : defaultEntryValue ? defaultEntryValue : undefined,
		}
	}

	onOk = () => {
		const {onOk} = this.props;
		const {value} = this.state;
		if (onOk) onOk(value);
	};

	onCancel = (e) => {
		const {onCancel} = this.props;
		if (onCancel) onCancel(e);
	};

	onChange = (value) => {
		this.setState({value})
	};

	render() {
		const {value} = this.state;
		const {visible, modalProps, entryType, entryProps} = this.props;

		return (
			<Modal className="cp-login"
			       {...modalProps}
			       okText={<FormattedMessage defaultMessage="Ok" id="common.ok"/>}
			       onOk={this.onOk}
			       cancelText={<FormattedMessage defaultMessage="Cancel" id="common.cancel"/>}
			       onCancel={this.onCancel}
			       visible={visible}>
				{entryType === "select" && (
					<Select onChange={(value) => this.onChange(value)}
					        value={value} {...entryProps}/>
				)}

				{entryType === "input" && (
					<Input onChange={(e) => this.onChange(e.target.value)}
					       value={value} {...entryProps}/>
				)}

				{entryType === "datepicker" && (
					<DatePicker onChange={(date) => this.onChange(date)}
					            value={value} {...entryProps}/>
				)}
			</Modal>
		);
	}
}

export default PromptInput;