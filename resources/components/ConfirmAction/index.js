import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Popconfirm} from "antd";

class ConfirmAction extends Component {
	render() {
		return (
			<Popconfirm
				title={
					<FormattedMessage
						defaultMessage="Are you sure?"
						id="common.popconfirm_title"/>
				}
				cancelText={
					<FormattedMessage
						defaultMessage="No"
						id="common.no"/>
				}
				okText={
					<FormattedMessage
						defaultMessage="Yes"
						id="common.yes"/>
				}
				{...this.props}/>
		);
	}
}

export default ConfirmAction;