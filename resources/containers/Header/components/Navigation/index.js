import React, {Component} from "react";
import {connect} from "react-redux";
import {Menu} from "antd";
import {generatePath, Link, matchPath, withRouter} from "react-router-dom";
import {FormattedMessage} from "react-intl";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import menuItemLinks from "containers/utils/menuItemLinks";

import {
	NAV_STYLE_HORIZONTAL_BOTTOM,
	NAV_STYLE_HORIZONTAL_INSIDE,
	NAV_STYLE_HORIZONTAL_LIGHT,
	NAV_STYLE_HORIZONTAL_TOP
} from "constants/ThemeSettings";
import {findKey} from "lodash";

const SubMenu = Menu.SubMenu;
const Item = Menu.Item;
const ItemGroup = Menu.ItemGroup;

class Navigation extends Component {
	constructor(props) {
		super(props);
	}

	deriveSelectedKey() {
		const {location} = this.props;

		return findKey(menuItemLinks, function(o) {
			return !!matchPath(location.pathname, {
				path: o.path, exact: true, strict: false
			});
		}) || "";
	};

	getNavStyleSubMenuClass = (navStyle) => {
		switch (navStyle) {
			case NAV_STYLE_HORIZONTAL_LIGHT:
				return "cp-menu-horizontal";
			case NAV_STYLE_HORIZONTAL_INSIDE:
				return "cp-menu-horizontal";
			case NAV_STYLE_HORIZONTAL_BOTTOM:
				return "cp-menu-horizontal colored-border";
			case NAV_STYLE_HORIZONTAL_TOP:
				return "cp-menu-horizontal colored-border";
			default:
				return "cp-menu-horizontal";
		}
	};

	render() {
		const {auth} = this.props;

		return (
			<Menu selectedKeys={[this.deriveSelectedKey()]}
			      mode="horizontal">

				{auth.can('access_control_panel') && (
					<Item>
						<a href="/admin">
							<i className="la la-laptop"/>
							<span>
								<FormattedMessage
									defaultMessage="Control Panel"
									id="common.control_panel"/>
							</span>
						</a>
					</Item>
				)}

				{menuItemLinks['home'] && (
					<Item key="home">
						<Link to={generatePath(menuItemLinks['home'].path)}>
							{menuItemLinks['home'].icon}
							{menuItemLinks['home'].text}
						</Link>
					</Item>
				)}

				{auth.check() && menuItemLinks['wallets'] && (
					<Item key="wallets">
						<Link to={generatePath(menuItemLinks['wallets'].path)}>
							{menuItemLinks['wallets'].icon}
							{menuItemLinks['wallets'].text}
						</Link>
					</Item>
				)}

				{menuItemLinks['marketplace'] && (
					<SubMenu key="marketplace"
					         title={menuItemLinks['marketplace'].text}
					         className="cp-menu-group">

						{menuItemLinks['marketplace.buy_coin'] && (
							<Item key="marketplace.buy_coin">
								<Link to={generatePath(menuItemLinks['marketplace.buy_coin'].path)}>
									{menuItemLinks['marketplace.buy_coin'].icon}
									{menuItemLinks['marketplace.buy_coin'].text}
								</Link>
							</Item>
						)}

						{menuItemLinks['marketplace.sell_coin'] && (
							<Item key="marketplace.sell_coin">
								<Link to={generatePath(menuItemLinks['marketplace.sell_coin'].path)}>
									{menuItemLinks['marketplace.sell_coin'].icon}
									{menuItemLinks['marketplace.sell_coin'].text}
								</Link>
							</Item>
						)}

						{auth.check() && menuItemLinks['marketplace.create_offer'] && (
							<Item key="marketplace.create_offer">
								<Link to={generatePath(menuItemLinks['marketplace.create_offer'].path)}>
									{menuItemLinks['marketplace.create_offer'].icon}
									{menuItemLinks['marketplace.create_offer'].text}
								</Link>
							</Item>
						)}
					</SubMenu>
				)}

				{auth.check() && menuItemLinks['profile'] && (
					<SubMenu key="profile"
					         title={menuItemLinks['profile'].text}
					         className="cp-menu-group">
						{menuItemLinks['profile.trades'] && (
							<Item key="profile.trades">
								<Link to={generatePath(menuItemLinks['profile.trades'].path, {
									name: auth.user.name
								})}>
									{menuItemLinks['profile.trades'].icon}
									{menuItemLinks['profile.trades'].text}
								</Link>
							</Item>
						)}

						{menuItemLinks['profile.offers'] && (
							<Item key="profile.offers">
								<Link to={generatePath(menuItemLinks['profile.offers'].path, {
									name: auth.user.name
								})}>
									{menuItemLinks['profile.offers'].icon}
									{menuItemLinks['profile.offers'].text}
								</Link>
							</Item>
						)}

						{menuItemLinks['profile.contacts'] && (
							<Item key="profile.contacts">
								<Link to={generatePath(menuItemLinks['profile.contacts'].path, {
									name: auth.user.name
								})}>
									{menuItemLinks['profile.contacts'].icon}
									{menuItemLinks['profile.contacts'].text}
								</Link>
							</Item>
						)}
					</SubMenu>
				)}

				{auth.can('manage_marketplace')  && menuItemLinks['moderation'] && (
					<SubMenu key="moderation"
					         title={menuItemLinks['moderation'].text}
					         className="cp-menu-group">
						{menuItemLinks['moderation.disputed_trades'] && (
							<Item key="moderation.disputed_trades">
								<Link to={generatePath(menuItemLinks['moderation.disputed_trades'].path)}>
									{menuItemLinks['moderation.disputed_trades'].icon}
									{menuItemLinks['moderation.disputed_trades'].text}
								</Link>
							</Item>
						)}
					</SubMenu>
				)}
			</Menu>
		);
	}
}

Navigation.propTypes = {};

const mapStateToProps = ({
	settings : {
		themeType,
		locale,
		navStyle,
	},
	auth
}) => ({
	themeType,
	locale,
	navStyle,
	auth : new Auth(auth)
});


export default pipe(
	connect(
		mapStateToProps
	),
	withRouter
)(Navigation);

