import React, {Component} from 'react';
import UserAvatar from "components/UserAvatar";
import {truncate, utcDateCalendarTime} from "support/utils/common";
import {find, isEmpty} from "lodash";
import {Avatar} from "antd";
import {FormattedMessage} from "react-intl";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import millify from "millify";

class ChatCell extends Component {
	constructor(props) {
		super(props);

		this.broadcast = new PrivateBroadcast();
		this.api = new ApiService();

		this.state = {
			participation : {}
		}
	}

	componentDidMount() {
		this.bindBroadcastEvents();
		this.fetchParticipation();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('ChatParticipationChanged', this.chatParticipationChangedListener);
		this.broadcast.listen('ChatUpdated', this.chatUpdatedListener);
	}

	chatParticipationChangedListener = (participation) => {
		if (isEmpty(participation)) return;
		const {auth} = this.props;

		if (auth.user.id === participation.user_id) {
			this.setState({participation});
		}
	};

	chatUpdatedListener = (e) => {
		const {axios, route} = this.api;
		if (isEmpty(e.chat)) return;

		this.fetchParticipation();

		const endpoint = route('chats.get', {
			chat : e.chat.id
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.updateChat(data)
			}))
			.catch(error => handleError(error));
	};

	updateChat(chat) {
		const {onChatUpdated} = this.props;
		if (typeof onChatUpdated === "function") {
			return onChatUpdated(chat);
		}
	}

	resetBroadcastChannel() {
		const {chat} = this.props;
		if (!isEmpty(chat)) {
			this.broadcast.setChannel('App.Chat.' + chat.id)
		} else {
			this.broadcast.unbind();
		}
	}

	fetchParticipation() {
		const {axios, route} = this.api;
		const {chat} = this.props;

		const endpoint = route('chats.participation', {
			chat : chat.id
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({participation : data})
			}))
			.catch(error => handleError(error));
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const prevChat = prevProps.chat;
		const chat = this.props.chat;

		if (prevChat.id !== chat.id) {
			console.info('ChatCell Updated');
			this.resetBroadcastChannel();
		}
	}

	getUserAvatar = () => {
		const participant = this.getHighlightedParticipant();

		if (!isEmpty(participant)) {
			return <UserAvatar user={participant.user} size={50}/>;
		} else {
			return <Avatar icon="message" size={50}/>;
		}
	};

	componentWillUnmount() {
		this.broadcast.unbind();
		this.api.cancel();
	}

	getTitle() {
		const {chat} = this.props;
		const participant = this.getHighlightedParticipant();

		if (isEmpty(participant)) {
			return (
				<FormattedMessage
					defaultMessage="Conversation"
					id="chats.conversation"/>
			);
		} else {
			let chatTitle = participant.user.name;

			if (chat.participants.length > 1) {
				chatTitle = (
					<FormattedMessage
						id="chats.cell_title"
						defaultMessage="{user} and {total} other(s)"
						values={{
							total : (chat.participants.length - 1),
							user  : participant.user.name,
						}}/>
				)
			}

			return (
				<React.Fragment>
					<span className="font-weight-medium">
						{chatTitle}
					</span>
				</React.Fragment>
			);
		}
	}

	getUser(id) {
		const {chat, auth} = this.props;
		const participants = chat.participants;

		if (auth.user.id === id) {
			return auth.user;
		} else {
			const participant = find(participants, function (o) {
				return !isEmpty(o.user) && o.user.id === id;
			});

			return !isEmpty(participant) ?
				participant.user : participant
		}
	}

	getLastMessage() {
		const {chat, auth} = this.props;
		const latestMessage = chat.latest_message;
		const participants = chat.participants;

		if (isEmpty(latestMessage)) return null;

		const messageBy = latestMessage.user;

		if (!isEmpty(messageBy)) {
			if (messageBy.id === auth.user.id) {
				return (
					<React.Fragment>
						<span className="font-weight-medium mr-1">
							<FormattedMessage
								defaultMessage="Me"
								id="common.me"/>:
						</span>
						{this.getMessageDetail(latestMessage, 23)}
					</React.Fragment>
				)
			} else if (participants.length > 1) {
				return (
					<React.Fragment>
						<span className="font-weight-medium mr-1">
							{messageBy.name}:
						</span>
						{this.getMessageDetail(latestMessage, 20)}
					</React.Fragment>
				)
			} else {
				return this.getMessageDetail(latestMessage, 25)
			}
		} else {
			return (
				<React.Fragment>
					<span className="font-weight-medium mr-1">
						<FormattedMessage
							defaultMessage="Unknown User"
							id="common.unknown_user"/>:
					</span>
					{this.getMessageDetail(latestMessage, 20)}
				</React.Fragment>
			)
		}
	}

	getMessageDetail = (message, length = 25) => {
		switch (message.type) {
			case "activity":
				return this.getActivityDetail(message.activity, length);
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

	getActivityDetail = (activity, length) => {
		return activity && (
			<span>
				{truncate(activity.body, length)}
			</span>
		)
	};

	getHighlightedParticipant() {
		if (isEmpty(this.highlightedParticpant)) {
			const {chat, auth} = this.props;
			const participants = chat.participants;

			this.highlightedParticpant = find(participants, function (o) {
				return !isEmpty(o.user) &&
					o.user.id !== auth.user.id;
			});
		}
		return this.highlightedParticpant;
	}

	getTime() {
		const {chat} = this.props;
		const latestMessage = chat.latest_message;

		return !isEmpty(latestMessage) ?
			utcDateCalendarTime(latestMessage.created_at) :
			null;
	}

	handleClick = () => {
		const {onOpen, chat} = this.props;
		if (typeof onOpen === "function") {
			return onOpen(chat);
		}
	};

	getUnreadCount() {
		const {participation} = this.state;
		const {active} = this.props;
		if (active || isEmpty(participation)) return null;

		const value = participation.unread_messages_count;
		if (!value || value <= 0) return null;
		return millify(value);
	}

	render() {
		const unreadCount = this.getUnreadCount();

		const {active} = this.props;
		const cellClass = `cp-chat-user-item ${active && 'active'}`;

		return (
			<div className={cellClass}
			     onClick={this.handleClick}>
				<div className="cp-chat-user-row">
					<div className="cp-chat-avatar">
						{this.getUserAvatar()}
					</div>

					<div className="cp-chat-info">
						<span className="cp-chat-name h4">
							{this.getTitle()}
						</span>
						<div className="cp-chat-desc">
							{this.getLastMessage()}
						</div>
						<div className="cp-chat-time">
							{this.getTime()}
						</div>
					</div>

					<div className="cp-chat-date">
						{unreadCount && (
							<div className="badge">
								{unreadCount}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default ChatCell;