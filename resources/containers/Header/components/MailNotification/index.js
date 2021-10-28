import React, {Component} from 'react';
import Auth from "support/Auth";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import {connect} from "react-redux";
import {Badge, Popover} from "antd";
import Content from "./components/Content";
import {pipe, sortDate} from "support/utils/common";
import {injectIntl} from "react-intl";
import {matchPath, withRouter} from "react-router-dom";
import menuItemLinks from "containers/utils/menuItemLinks";
import {filter, isEmpty, uniqBy} from "lodash";
import {mailSound} from "support/utils/audio";

class MailNotification extends Component {
	constructor(props) {
		super(props);

		this.broadcast = new PrivateBroadcast();

		this.state = {
			data : [],
		}
	}

	componentDidMount() {
		this.bindBroadcastEvents();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('NewChatMessage', this.newChatMessageListener);
	}

	newChatMessageListener = (e) => {
		if (isEmpty(e.message)) return;
		if (!this.canNotify(e.message)) return;

		const message = e.message;

		this.setState(({data}) => {
			return {
				data : this.sortMessages(data.concat(message))
			}
		}, () => {
			this.playNotificationSound();
		});
	};

	playNotificationSound = () => {
		mailSound.play().catch(error => {
			console.log(error)
		});
	};

	getActiveChatParams() {
		const {location} = this.props;

		const match = matchPath(location.pathname, {
			exact  : true,
			path   : menuItemLinks['chat.view'].path,
			strict : false
		});

		return match && match.params;
	}

	canNotify(message) {
		const params = this.getActiveChatParams();
		const {auth} = this.props;

		if (!isEmpty(params) && message.chat_id === params.token) return false;
		if (message.type === "activity") return false;

		return message.user_id !== auth.user.id;
	}

	sortMessages = (messages) => {
		if (!Array.isArray(messages)) return messages;
		messages = messages.sort((a, b) => sortDate(b.created_at, a.created_at));
		return uniqBy(messages, 'id');
	};

	resetBroadcastChannel() {
		const {auth} = this.props;
		if (auth.check()) {
			this.broadcast.setChannel('Auth.User.' + auth.user.id)
		} else {
			this.broadcast.unbind();
		}
	}

	updateNotifications() {
		const params = this.getActiveChatParams();
		if (isEmpty(params)) return;

		const {data} = this.state;
		const notifications = filter(data, function (o) {
			return o.chat_id !== params.token;
		});

		this.setState({data : notifications});
		console.log('MailNotification Updated');
	}

	componentWillUnmount() {
		this.broadcast.unbind();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const location = this.props.location;
		const prevLocation = prevProps.location;
		const user = this.props.auth.user;
		const prevUser = prevProps.auth.user;

		if (location.pathname !== prevLocation.pathname) {
			this.updateNotifications()
		}

		if (prevUser.id !== user.id) {
			console.log('MailNotification Updated');
			this.resetBroadcastChannel();
		}
	}

	clearAll = () => {
		this.setState({data : []})
	};

	render() {
		const {data} = this.state;
		return (
			<Popover placement="bottomRight"
			         content={<Content onClearAll={this.clearAll} data={data}/>}
			         trigger="click"
			         overlayClassName="cp-popover-horizontal">
				<Badge count={data.length}
				       className="mb-0"
				       overflowCount={9}>
					<i className="cp-pointer la la-comments"/>
				</Badge>
			</Popover>
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
)(MailNotification);