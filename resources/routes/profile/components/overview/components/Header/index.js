import React, {Component} from 'react';
import {Button, Rate} from "antd";
import {FormattedMessage} from "react-intl";
import millify from "millify";
import UserAvatar from "components/UserAvatar";
import {Link} from "react-router-dom";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import {isEmpty} from "lodash"

class Header extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();
	}

	addContact = () => {
		const {user, auth, onAddContact} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.contacts.add', {
			name : auth.user.name
		}).url();

		axios.post(endpoint, {id : user.id})
			.then(response => handleSuccess(response, (data) => {
				if (onAddContact) onAddContact()
			}))
			.catch(error => handleError(error))
	};

	removeContact = () => {
		const {user, auth, onRemoveContact} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.contacts.remove', {
			name : auth.user.name
		}).url();

		axios.post(endpoint, {id : user.id})
			.then(response => handleSuccess(response, (data) => {
				if (onRemoveContact) onRemoveContact()
			}))
			.catch(error => handleError(error))
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {user, auth} = this.props;

		return (
			<div className="cp-profile-banner">
				<div className="cp-profile-container">
					<div className="cp-profile-banner-top">
						<div className="cp-profile-banner-top-left">
							<div className="cp-profile-banner-avatar">
								<UserAvatar className="cp-fs-3x"
								            size={90} user={user}/>
							</div>
							<div className="cp-profile-banner-avatar-info">
								<h2 className="mb-2 mb-sm-3 cp-fs-xxl font-weight-light text-sm-left text-center">
									{user.name}
								</h2>
								<div className="mb-0 cp-fs-lg  text-sm-left text-center">
									<Rate value={user.average_marketplace_rating} disabled/>
									<span className={"ml-2"}>
										({millify(user.total_marketplace_rating)})
									</span>
								</div>
							</div>
						</div>
						<div className="cp-profile-banner-top-right">
							<ul className="cp-follower-list">
								<li>
									<span className="cp-follower-title cp-fs-lg font-weight-medium">
										{millify(user.marketplace_stats.total_trades)}
									</span>
									<span className="cp-fs-sm">
										<FormattedMessage
											defaultMessage="Trades"
											id="common.trades"/>
									</span>
								</li>
								<li>
									<span className="cp-follower-title cp-fs-lg font-weight-medium">
										{millify(user.marketplace_stats.total_offers)}
									</span>
									<span className="cp-fs-sm">
										<span className="cp-fs-sm">
											<FormattedMessage
												defaultMessage="Offers"
												id="common.offers"/>
										</span>
									</span>
								</li>
							</ul>
						</div>
					</div>
					<div className="cp-profile-banner-bottom">
						<div className="cp-tab-list">
							<ul className="cp-navbar-nav d-flex align-items-center">
								<li>
									<Link to={`/profile/${user.name}/offers`}>
										<span className="cp-link">
											<i className="la la-suitcase cp-fs-lg mr-2"/>
											<FormattedMessage
												defaultMessage="My Offers"
												id="common.my_offers"/>
										</span>
									</Link>
								</li>

								{typeof user.authenticated_contact_pivot !== "undefined" && (
									<li>
										{isEmpty(user.authenticated_contact_pivot) ? (
											<Button type="primary" size="small"
											        className="mb-0" shape="round"
											        onClick={this.addContact}
											        icon="plus">
												<span>
													<FormattedMessage
														defaultMessage="Add to Contacts"
														id="common.add_to_contacts"/>
												</span>
											</Button>
										) : (
											<Button type="default" size="small"
											        className="mb-0" shape="round"
											        onClick={this.removeContact}
											        icon="minus">
												<span>
													<FormattedMessage
														defaultMessage="Remove from Contacts"
														id="common.remove_from_contacts"/>
												</span>
											</Button>
										)}
									</li>
								)}
							</ul>
						</div>

						<span className="cp-profile-setting mt-3 mt-sm-0 d-flex">
							<span className="vertical-align-middle">
								{(auth.can('manage_users') || auth.user.id === user.id) && (
									<Link to={`/profile/${user.name}/settings`}>
										<span className="cp-link">
											<FormattedMessage
												defaultMessage="Settings"
												id="common.settings"/>
										</span>
									</Link>
								)}
							</span>
						</span>

					</div>
				</div>
			</div>
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
	)
)(Header);