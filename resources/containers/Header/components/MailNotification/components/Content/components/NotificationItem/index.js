import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe, truncate, utcDateCalendarTime} from "support/utils/common";
import {connect} from "react-redux";
import {FormattedMessage, injectIntl} from "react-intl";
import {generatePath, Link, withRouter} from "react-router-dom";
import UserAvatar from "components/UserAvatar";
import {isEmpty} from "lodash";
import menuItemLinks from "containers/utils/menuItemLinks";

class NotificationItem extends Component {
	getMessageDetail = (message, length = 25) => {
		switch (message.type) {
			case "text":
				return this.getTextDetail(message.text, length);
			case "attachment":
				return this.getAttachmentDetail(message.attachment, length);
			default:
				return null;
		}
	};

	getTextDetail = (text, length) => {
		if (isEmpty(text)) {
			return (
				<span>
					<i className="la la-ban mr-1"/>
					<span>
						<FormattedMessage
							defaultMessage="Message Deleted"
							id="chats.message_deleted"/>
					</span>
				</span>
			)
		} else {
			return (
				<span>
					{truncate(text.body, length)}
				</span>
			)
		}
	};

	getAttachmentDetail = (attachment, length) => {
		if (isEmpty(attachment)) {
			return (
				<span>
					<i className="la la-ban mr-1"/>
					<span>
						<FormattedMessage
							defaultMessage="Message Deleted"
							id="chats.message_deleted"/>
					</span>
				</span>
			)
		} else {
			return (
				<span>
					<i className="la la-paperclip mr-1"/>
					<span>
						{truncate(attachment.name, length)}
					</span>
				</span>
			)
		}
	};

	goToChat = () => {
		const {history, notification} = this.props;

		const path = generatePath(menuItemLinks['chat.view'].path, {
			token : notification.chat_id
		});

		if (!isEmpty(history) && path) {
			return history.push(path);
		}
	};

	render() {
		const {notification} = this.props;
		const user = notification.user;

		return (
			<li className="media">
				<div className="cp-user-thumb mr-3">
					<UserAvatar
						showPresence={false}
						user={notification.user}
						size={40}/>
				</div>

				<div className="media-body">
					<div className="flex-row justify-content-between align-items-center">
						<h5 className="cp-user-name mb-0">
							<Link to={`/profile/${user.name}`}>
								{user && user.name}
							</Link>
							<small className="float-right">
								{utcDateCalendarTime(notification.created_at)}
							</small>
						</h5>
					</div>

					<p className="fs-sm">
						{this.getMessageDetail(notification, 150)}
					</p>

					<span className="cp-btn cp-btn-sm"
					      onClick={this.goToChat}>
						<i className="la la-eye cp-fs-lg mr-2"/>
						<FormattedMessage
							defaultMessage="Go To Chat"
							id="common.go_to_chat"/>
					</span>
				</div>
			</li>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	injectIntl,
	withRouter
)(NotificationItem);
