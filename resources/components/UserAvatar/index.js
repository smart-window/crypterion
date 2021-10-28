import React, {Component} from 'react';
import {Avatar} from "antd";
import {assign, isEqual, round} from "lodash";
import {connect} from "react-redux";
import {pipe, stringToHex} from "support/utils/common";
import Broadcast from "support/Services/Broadcast";

class UserAvatar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			status : (props.user && props.user.presence) || null
		};

		this.broadcast = new Broadcast();
	}

	componentDidMount() {
		this.bindBroadcastEvents();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('UserPresenceChanged', this.userPresenceChangedListener);
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const prevUser = prevProps.user;
		const user = this.props.user;

		if (!isEqual(prevUser, user)) {
			if (user && user.id) {
				if ((prevUser && prevUser.id) !== user.id) {

					this.setState({status : user.presence}, () => {
						this.resetBroadcastChannel();
					});

					console.log('Updated UserAvatar');
				}
			} else {

				this.setState({status : null}, () => {
					this.resetBroadcastChannel();
				});

				console.log('Updated UserAvatar');
			}
		}
	}

	resetBroadcastChannel() {
		const {user} = this.props;
		if (user && user.id) {
			this.broadcast.setChannel('Public.User.' + user.id)
		} else {
			this.broadcast.unbind();
		}
	}

	userPresenceChangedListener = (e) => {
		this.setState({status : e.presence});
	};

	getStatusClass = () => {
		const {status} = this.state;
		const {showPresence} = this.props;

		if (showPresence && status) {
			return `avatar-status ${status}`;
		} else {
			return "avatar-status";
		}
	};

	getStatusStyle = () => {
		const {size} = this.props;
		const style = {};

		switch (size) {
			case 'large':
				style.height = style.width = '10px';
				break;
			case 'default':
				style.height = style.width = '8px';
				break;
			case 'small':
				style.height = style.width = '3px';
				break;
			default :
				if (!Number.isNaN(size)) {
					const scale = round(size / 4);
					const aspect = (scale > 0) ? `${scale}px` : '8px';
					style.height = style.width = aspect;
				} else {
					style.height = style.width = '8px';
				}
		}
		return style;
	};

	componentWillUnmount() {
		this.broadcast.unbind();
	}

	render() {
		const {
			theme, src, children, icon, themeType, dispatch,
			user, showPresence, ...otherProps
		} = this.props;

		let avatarStyle = {color : '#fff', verticalAlign : 'middle'};
		let customProps = {...otherProps};

		if (theme === "dark") {
			avatarStyle = assign(avatarStyle, {backgroundColor : '#fff'})
		}

		if (user && user.profile && user.profile.picture) {
			customProps.src = user.profile.picture;
		} else if (user && user.name && typeof user.name === "string") {
			avatarStyle = assign(avatarStyle, {backgroundColor : stringToHex(user.name)});

			customProps.children = user.name.charAt(0).toUpperCase();
		} else if (typeof children === "string") {
			avatarStyle = assign(avatarStyle, {backgroundColor : stringToHex(children)});

			customProps.children = children.charAt(0).toUpperCase();
		} else {
			customProps.icon = "user"
		}

		const statusClass = this.getStatusClass();
		const statusStyle = this.getStatusStyle();

		return (
			<span className="d-inline-block">
				<span className="avatar">
					<Avatar {...customProps} style={avatarStyle}/>
					<span className={statusClass} style={statusStyle}/>
				</span>
			</span>
		);
	}
}

const mapStateToProps = ({
	settings : {
		themeType,
	}
}) => ({
	themeType,
});

UserAvatar.defaultProps = {
	showPresence : true,
};

export default pipe(
	connect(
		mapStateToProps
	)
)(UserAvatar);