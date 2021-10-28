import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Button} from "antd";

class Empty extends Component {
	render() {
		const {onToggleDrawer} = this.props;

		return (
			<div className="cp-comment-box">
				<div className="cp-fs-80">
					<i className="la la-comments"/>
				</div>
				<h1 className="text-muted">
					<FormattedMessage
						defaultMessage="Select Chat to Begin!"
						id="chat.select_to_begin"/>
				</h1>
				<Button type="primary"
				        className="d-block d-lg-none mt-3"
				        onClick={onToggleDrawer}>
					<FormattedMessage
						defaultMessage="Show Chats"
						id="chat.show_chats"/>
				</Button>
			</div>
		);
	}
}

export default Empty;