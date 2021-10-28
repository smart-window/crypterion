import React, {Component} from 'react';
import {Button, Result} from "antd";
import {FormattedMessage} from "react-intl";

class NotFound extends Component {
	render() {
		const {onToggleDrawer} = this.props;
		return (
			<div className="d-flex align-items-center w-100">
				<div className="text-center w-100">
					<Result
						title={
							<FormattedMessage
								defaultMessage="Chat could not be found."
								id="chats.chat_not_found_title"/>
						}
						extra={
							<Button type="primary"
							        className="d-inline-block d-lg-none mt-3"
							        onClick={onToggleDrawer}>
								<FormattedMessage
									defaultMessage="Show Chats"
									id="chat.show_chats"/>
							</Button>
						}
						subTitle={
							<FormattedMessage
								defaultMessage="Please, select a new chat to display!"
								id="chats.chat_not_found_sub_title"/>
						}
						status="404"/>
				</div>
			</div>
		);
	}
}

export default NotFound;