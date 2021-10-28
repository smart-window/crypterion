import React, {Component} from 'react';
import Auth from "support/Auth";
import {connect} from "react-redux";
import {Badge, Popover} from "antd";
import Content from "./components/Content";
import {pipe} from "support/utils/common";
import {injectIntl} from "react-intl";
import {withRouter} from "react-router-dom";
import {handleError, handleSuccess} from "support/utils/promise";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import ApiService from "support/Services/Api";
import {isEmpty} from "lodash";
import {appSound} from "support/utils/audio";

class AppNotification extends Component {
	constructor(props) {
		super(props);

		this.broadcast = new PrivateBroadcast();
		this.api = new ApiService();

		this.state = {
			contentKey : 1,
			status     : {}
		}
	}

	componentDidMount() {
		this.bindBroadcastEvents();
		this.fetchStatus();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('UserNotificationsStatusChanged', this.userNotificationsStatusChangedListener);
	}

	userNotificationsStatusChangedListener = (status) => {
		if (isEmpty(status)) return;

		const recentNotifications = status.recent_notifications;
		const previousNotifications = this.state.status.recent_notifications;
		if (recentNotifications > previousNotifications) {
			this.resetContentKey();
			this.playNotificationSound();
		}

		this.setState({status});
	};

	resetContentKey() {
		this.setState({
			contentKey : Math.floor(Math.random() * 100)
		})
	};

	playNotificationSound = () => {
		appSound.play().catch(error => {
			console.log(error)
		});
	};

	resetBroadcastChannel() {
		const {auth} = this.props;
		if (auth.check()) {
			this.broadcast.setChannel('Auth.User.' + auth.user.id)
		} else {
			this.broadcast.unbind();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const user = this.props.auth.user;
		const prevUser = prevProps.auth.user;

		if (prevUser.id !== user.id) {
			console.log('AppNotification Updated');
			this.resetBroadcastChannel();
		}
	}

	fetchStatus() {
		const {axios, route} = this.api;
		const endpoint = route('user.notifications.status');

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({status : data})
			}))
			.catch(error => handleError(error));
	}

	handleVisibleChange = (visible) => {
		if (visible) {
			this.updateStatus()
		}
	};

	updateStatus = () => {
		const {axios, route} = this.api;

		const endpoint = route('user.notifications.update-status');

		axios.post(endpoint.url())
			.then(response => handleSuccess(response))
			.catch(error => handleError(error));
	};

	componentWillUnmount() {
		this.broadcast.unbind();
		this.api.cancel();
	}

	render() {
		const {status, contentKey} = this.state;
		const recentNotifications = status.recent_notifications;

		return (
			<Popover placement="bottomRight"
			         onVisibleChange={this.handleVisibleChange}
			         trigger="click"
			         content={<Content key={contentKey}/>}
			         overlayClassName="cp-popover-horizontal">
				<Badge className="mb-0"
				       count={recentNotifications}
				       overflowCount={9}>
					<i className="cp-pointer la la-bell"/>
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
)(AppNotification);