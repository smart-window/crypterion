import React, {Component} from "react";
import {Menu} from "antd";
import {generatePath, Link, matchPath, withRouter} from "react-router-dom";
import {pipe} from "support/utils/common";
import Logo from "../Logo";
import {FormattedMessage} from "react-intl";
import {connect} from "react-redux";
import UserMenu from "../UserMenu";
import AuthLinks from "../AuthLinks";
import Auth from "support/Auth";
import {NAV_STYLE_VERTICAL_MINI_SIDEBAR, TAB_BREAKPOINT, THEME_TYPE_LITE} from "constants/ThemeSettings";
import {toggleNavMenu} from "redux/actions/Settings";
import menuItemLinks from "containers/utils/menuItemLinks";
import {findKey} from "lodash";
import ScrollArea from "components/ScrollArea";

const Item = Menu.Item;
const ItemGroup = Menu.ItemGroup;

class Navigation extends Component {
	deriveSelectedKey() {
		const {location} = this.props;

		return findKey(menuItemLinks, function (o) {
			return !!matchPath(location.pathname, {
				path : o.path, exact : true
			});
		});
	};

	deriveDefaultOpenKeys = () => {
		const key = this.deriveSelectedKey();
		if (typeof key !== "string") return [];

		const steps = key.split('.');
		steps.pop();

		if (steps.length < 3) {
			return this.isMiniSidebar() ? [] : [steps.join('.')];
		}

		const value = [steps[0]], keys = [];

		for (let i = 1; i < steps.length; i++) {
			value.push(steps[i]);
			keys.push(value.join('.'));
		}
		return this.isMiniSidebar() ? [] : keys;
	};

	isMiniSidebar() {
		const {width, navStyle} = this.props;

		return (width >= TAB_BREAKPOINT) ?
			navStyle === NAV_STYLE_VERTICAL_MINI_SIDEBAR :
			false;
	};

	onMenuClick = () => {
		this.props.toggleNavMenu(true);
	};

	render() {
		const {themeType, windowSize, auth} = this.props;

		return (
			<React.Fragment>
				<Logo/>
				<div className="cp-sidebar-content">
					<ScrollArea className="cp-layout-sider-scrollbar"
					            style={{height : windowSize.height - 72}}>
						<div className="cp-sidebar-notifications">
							<UserMenu/>
							<AuthLinks/>
						</div>

						<Menu selectedKeys={[this.deriveSelectedKey()]}
						      defaultOpenKeys={this.deriveDefaultOpenKeys()}
						      mode="inline"
						      theme={themeType === THEME_TYPE_LITE ? 'lite' : 'dark'}
						      onClick={this.onMenuClick}>
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

							<Menu.Divider className="my-2"/>

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
								<ItemGroup key="marketplace"
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
								</ItemGroup>
							)}

							{auth.check() && menuItemLinks['profile'] && (
								<ItemGroup key="profile"
								           title={menuItemLinks['profile'].text}
								           className="cp-menu-group">
									{menuItemLinks['profile.trades'] && (
										<Item key="profile.trades">
											<Link to={generatePath(menuItemLinks['profile.trades'].path, {
												name : auth.user.name
											})}>
												{menuItemLinks['profile.trades'].icon}
												{menuItemLinks['profile.trades'].text}
											</Link>
										</Item>
									)}

									{menuItemLinks['profile.offers'] && (
										<Item key="profile.offers">
											<Link to={generatePath(menuItemLinks['profile.offers'].path, {
												name : auth.user.name
											})}>
												{menuItemLinks['profile.offers'].icon}
												{menuItemLinks['profile.offers'].text}
											</Link>
										</Item>
									)}

									{menuItemLinks['profile.contacts'] && (
										<Item key="profile.contacts">
											<Link to={generatePath(menuItemLinks['profile.contacts'].path, {
												name : auth.user.name
											})}>
												{menuItemLinks['profile.contacts'].icon}
												{menuItemLinks['profile.contacts'].text}
											</Link>
										</Item>
									)}
								</ItemGroup>
							)}

							{auth.can('manage_marketplace') && menuItemLinks['moderation'] && (
								<ItemGroup key="moderation"
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
								</ItemGroup>
							)}
						</Menu>
					</ScrollArea>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	settings : {
		locale,
		windowSize,
		themeType,
		navStyle,
	},
	auth
}) => ({
	locale,
	windowSize,
	themeType,
	navStyle,
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps,
		{
			toggleNavMenu,
		}
	),
	withRouter
)(Navigation);

