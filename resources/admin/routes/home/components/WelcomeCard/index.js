import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import UserAvatar from "admin/components/UserAvatar";
import {pipe, utcDateCalendarTime} from "admin/support/utils/common";
import Auth from "admin/support/Auth";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {Icon, Popover, Tooltip} from "antd";
import {startCase} from "lodash";

const messages = defineMessages({
	profile : {
		defaultMessage : "Profile",
		id             : "admin.profile"
	},

	settings : {
		defaultMessage : "Settings",
		id             : "admin.settings"
	},
});

class WelcomeCard extends Component {
	render() {
		const {auth, superAdminRole, intl} = this.props;
		return (
			<Widget styleName="cp-card-full py-3 m-0">
				<div className="text-center px-3 pt-3">
					<div className="d-flex justify-content-around align-items-center mb-3">
						<Tooltip title={intl.formatMessage(messages.settings)}>
							<a href={`/profile/${auth.user.name}/settings`}>
								<i className="la la-cog cp-fs-xxl cp-text-grey"/>
							</a>
						</Tooltip>

						<UserAvatar user={auth.user}
						            showPresence={false}
						            size={80}/>

						<Tooltip title={intl.formatMessage(messages.profile)}>
							<a href={`/profile/${auth.user.name}`}>
								<i className="la la-user cp-fs-xxl cp-text-grey"/>
							</a>
						</Tooltip>
					</div>
					<div>
						<h2 className="mb-2">
							<FormattedMessage
								defaultMessage="Welcome, {name}"
								id="admin.widget.welcome_card.greetings"
								values={{
									name : <b>{auth.user.name}</b>
								}}/>
						</h2>

						<div className="cp-text-grey mb-4">
							{auth.user.all_roles.map((role) => role === superAdminRole ? startCase(role) : role)
								.join(", ")}
						</div>

						<div className="mb-3">
							{auth.user.last_login_at && (
								<div className="mb-1 d-flex align-items-center justify-content-center">
									<i className="la la-clock cp-fs-lg mr-2"/>
									<span>
										<FormattedMessage
											defaultMessage="Login: {date}"
											id="admin.widget.welcome_card.last_login"
											values={{
												date : (
													<span className="font-weight-medium">
														{utcDateCalendarTime(auth.user.last_login_at)}
													</span>
												)
											}}/>
									</span>
								</div>
							)}

							<div className="mb-1 d-flex align-items-center justify-content-center">
								<i className="la la-money-bill cp-fs-lg mr-2"/>
								<span className="mr-1">
									<FormattedMessage
										defaultMessage="Currency: {currency}"
										id="admin.widget.welcome_card.currency"
										values={{
											currency : (
												<span>
													{auth.user.currency}
												</span>
											)
										}}/>
								</span>
								<span>
									<Popover trigger="click"
									         overlayStyle={{maxWidth : 250}}
									         content={
										         <FormattedMessage
											         defaultMessage={
												         "Financial statistics will be shown to you in your base currency. " +
												         "You can update this in your settings."
											         }
											         id="admin.widget.welcome_card.currency_info"/>
									         }>
										<Icon type="question-circle" theme="filled"/>
									</Popover>
								</span>
							</div>
						</div>
					</div>
				</div>
			</Widget>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	superAdminRole : auth.superAdminRole,
	auth           : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps,
	),
	withRouter,
	injectIntl
)(WelcomeCard);