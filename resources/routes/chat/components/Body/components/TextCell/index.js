import React, {Component} from 'react';
import UserAvatar from "components/UserAvatar";
import {utcDateCalendarTime} from "support/utils/common";
import {isEmpty} from "lodash";
import {FormattedMessage} from "react-intl";
import {Link} from "react-router-dom";

class TextCell extends Component {
	getUserAvatar = () => {
		const {message} = this.props;
		const user = message.user;
		return (
			<Link to={`/profile/${user.name}`}>
				<UserAvatar
					className="align-self-end"
					user={user} size={40}/>
			</Link>
		)
	};

	getTextDetail = () => {
		const {message} = this.props;
		if (isEmpty(message.text)) {
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
					{message.text.body}
				</span>
			)
		}
	};

	getTimestamp = () => {
		const {message} = this.props;
		return message.created_at && (
			<small className="text-muted">
				{utcDateCalendarTime(message.created_at)}
			</small>
		);
	};

	render() {
		const {mode} = this.props;

		const itemClass = (mode === 'right') ?
			"cp-chat-item flex-row-reverse" : "cp-chat-item";

		return (
			<div className={itemClass}>
				{this.getUserAvatar()}

				<div className="cp-bubble-block">
					<div className="cp-bubble d-inline-block">
						<div className="cp-message mb-2">
							{this.getTextDetail()}
						</div>
						<div className="cp-time text-right">
							{this.getTimestamp()}
						</div>
					</div>
				</div>
			</div>
		);
	}
}


export default TextCell;