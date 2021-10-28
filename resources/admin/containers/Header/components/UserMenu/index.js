import React, {Component} from "react";
import {connect} from "react-redux";
import {Dropdown, Menu} from "antd";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import UserAvatar from "admin/components/UserAvatar";
import {setAuthUser} from "admin/redux/actions/Auth";
import Auth from "admin/support/Auth";
import ApiService from "admin/support/Services/Api";
import {handleSuccess} from "admin/support/utils/promise";
import {pipe} from "admin/support/utils/common";
import {withRouter} from "react-router-dom";

const messages = defineMessages({
	logoutSuccessful : {
		defaultMessage : "Logout Successful.",
		id             : "admin.logout_successful"
	}
});

class UserMenu extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();
	}

	handleSignOut = () => {
		const {axios, route} = this.api;
		const {intl} = this.props;

		axios.post(route('admin.auth.logout').url())
			.then(response => handleSuccess(response, (data) => {
				window.location.replace('/');
			}, intl.formatMessage(messages.logoutSuccessful)));
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	getMenuOptions = (user) => {
		return (
			<Menu>
				<Menu.Item key="1">
					<a href={"/"}>
						<i className="la la-globe"/>
						<span className="ml-1">
							<FormattedMessage
								defaultMessage="User Area"
								id="admin.user_area"/>
						</span>
					</a>
				</Menu.Item>

				<Menu.Divider/>

				<Menu.Item key="3"
				           onClick={this.handleSignOut}>
					<i className="la la-power-off"/>
					<span className="ml-1">
						<FormattedMessage
							defaultMessage="Logout"
							id="common.logout"/>
					</span>
				</Menu.Item>
			</Menu>
		);
	};

	render() {
		const {auth, theme} = this.props;
		return (
			<div className="d-flex align-items-center">
				<span className="d-inline-block mr-3 fs-md">
					<FormattedMessage
						defaultMessage="Hi, {name}"
						id="common.user_greeting"
						values={{
							name : (
								<span className="font-weight-medium">
									{auth.user.name}
								</span>
							)
						}}/>
				</span>
				<Dropdown placement="bottomRight"
				          trigger={['click']}
				          overlay={this.getMenuOptions(auth.user)}
				          disabled={!auth.check()}>
					<UserAvatar theme={theme} size={40}
					            showPresence={false}
					            className="cp-pointer"
					            user={auth.user}/>
				</Dropdown>
			</div>
		)
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	injectIntl,
	connect(
		mapStateToProps,
		{setAuthUser}
	),
	withRouter
)(UserMenu);
