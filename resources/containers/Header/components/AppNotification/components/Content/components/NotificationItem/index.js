import React, {Component} from 'react';
import {Avatar} from "antd";
import {isEmpty, startsWith} from "lodash";
import {pipe, utcDateCalendarTime} from "support/utils/common";
import menuItemLinks from "containers/utils/menuItemLinks";
import {generatePath, withRouter} from "react-router-dom";
import Auth from "support/Auth";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";

class NotificationItem extends Component {
	handleClick = () => {
		this.markAsRead();
		const {notification, auth, history} = this.props;
		let path = null;

		const parameters = notification.data.parameters;

		if (startsWith(notification.type, "App\\Notifications\\Auth")) {
			path = generatePath(menuItemLinks['profile.settings'].path, {
				name : auth.user.name
			});
		} else if (startsWith(notification.type, "App\\Notifications\\Marketplace")) {
			path = generatePath(menuItemLinks['profile.trades'].path, {
				name : auth.user.name
			});

			if (!isEmpty(parameters) && parameters.chat_id) {
				path = generatePath(menuItemLinks['chat.view'].path, {
					token : parameters.chat_id
				});
			}
		} else if (startsWith(notification.type, "App\\Notifications\\Wallet")) {
			path = generatePath(menuItemLinks['wallets'].path);
		}

		if (!isEmpty(history) && path) {
			return history.push(path);
		}
	};

	markAsRead() {
		const {onMarkAsRead} = this.props;
		if (typeof onMarkAsRead === "function") {
			return onMarkAsRead()
		}
	}

	getAvatar() {
		const {notification} = this.props;
		const isUnread = !notification.read_at;
		let icon = "bell";

		if (startsWith(notification.type, "App\\Notifications\\Auth")) {
			icon = "safety";
		} else if (startsWith(notification.type, "App\\Notifications\\Marketplace")) {
			icon = "dollar";
		} else if (startsWith(notification.type, "App\\Notifications\\Wallet")) {
			icon = "wallet";
		}
		return <Avatar icon={icon}
		               className={`mr-3 ${isUnread && "cp-bg-secondary"}`}
		               size={40}/>;
	}

	render() {
		const {notification} = this.props;
		const data = notification.data;

		return (
			<li className="media" onClick={this.handleClick}>
				{this.getAvatar()}
				<div className="media-body align-self-center">
					<p className="fs-sm mb-0">
						{data.message}
					</p>

					<small className="cp-meta-date text-muted">
						{utcDateCalendarTime(notification.created_at)}
					</small>
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

