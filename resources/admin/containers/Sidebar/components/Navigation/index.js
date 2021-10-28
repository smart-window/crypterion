import React, {Component} from "react";
import {Menu, Tag} from "antd";
import {generatePath, Link, matchPath, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import Auth from "admin/support/Auth";
import {pipe} from "admin/support/utils/common";
import {toggleNavMenu} from "admin/redux/actions/Settings";
import menuItemLinks from 'admin/containers/utils/menuItemLinks'
import {findKey} from "lodash";
import context from "admin/context";
import ScrollArea from "admin/components/ScrollArea";

const ItemGroup = Menu.ItemGroup;
const Item = Menu.Item;

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
			return [steps.join('.')];
		}

		const value = [steps[0]], keys = [];

		for (let i = 1; i < steps.length; i++) {
			value.push(steps[i]);
			keys.push(value.join('.'));
		}
		return keys;
	};

	canShowPlatform() {
		const {auth} = this.props;

		return auth.can("manage_integration") ||
			auth.can("manage_translation") ||
			auth.can("manage_customization");
	}

	onMenuClick = () => {
		this.props.toggleNavMenu(true);
	};

	render() {
		const {windowSize, auth} = this.props;

		return (
			<React.Fragment>
				<div className="cp-layout-sider-header no-toggle">
					<a href="/" className="cp-sidebar-logo">
						<img alt={context.name} src={context.logoUrl || require("assets/images/logo.png")}/>
					</a>
				</div>

				<div className="cp-sidebar-content mt-3">
					<ScrollArea className="cp-layout-sider-scrollbar mt-3"
					            style={{height : windowSize.height - 72}}
					            data-simplebar={true}>

						<Menu selectedKeys={[this.deriveSelectedKey()]}
						      theme={'dark'}
						      onClick={this.onMenuClick}
						      defaultOpenKeys={this.deriveDefaultOpenKeys()}
						      mode="inline">

							{menuItemLinks['home'] && (
								<Item key="home">
									<Link to={generatePath(menuItemLinks['home'].path)}>
										{menuItemLinks['home'].icon}
										{menuItemLinks['home'].text}
									</Link>
								</Item>
							)}

							{auth.can("manage_wallets") && menuItemLinks['wallets'] && (
								<Item key="wallets">
									<Link to={generatePath(menuItemLinks['wallets'].path)}>
										{menuItemLinks['wallets'].icon}
										{menuItemLinks['wallets'].text}
									</Link>
								</Item>
							)}

							{auth.can("manage_user_roles") && menuItemLinks['roles'] && (
								<Item key="roles">
									<Link to={generatePath(menuItemLinks['roles'].path)}>
										{menuItemLinks['roles'].icon}
										{menuItemLinks['roles'].text}
									</Link>
								</Item>
							)}

							{auth.can("manage_users") && menuItemLinks['users'] && (
								<Item key="users">
									<Link to={generatePath(menuItemLinks['users'].path)}>
										{menuItemLinks['users'].icon}
										{menuItemLinks['users'].text}
									</Link>
								</Item>
							)}

							{auth.can("manage_settings") && menuItemLinks['settings'] && (
								<ItemGroup key="settings"
								           title={menuItemLinks['settings'].text}
								           className="cp-menu-group">
									{auth.can("manage_marketplace") && menuItemLinks['settings.marketplace'] && (
										<Item key="settings.marketplace">
											<Link to={generatePath(menuItemLinks['settings.marketplace'].path)}>
												{menuItemLinks['settings.marketplace'].icon}
												{menuItemLinks['settings.marketplace'].text}
											</Link>
										</Item>
									)}

									{auth.can("manage_notification") && menuItemLinks['settings.notification'] && (
										<Item key="settings.notification">
											<Link to={generatePath(menuItemLinks['settings.notification'].path)}>
												{menuItemLinks['settings.notification'].icon}
												{menuItemLinks['settings.notification'].text}
											</Link>
										</Item>
									)}

									{menuItemLinks['settings.configuration'] && (
										<Item key="settings.configuration">
											<Link to={generatePath(menuItemLinks['settings.configuration'].path)}>
												{menuItemLinks['settings.configuration'].icon}
												{menuItemLinks['settings.configuration'].text}
											</Link>
										</Item>
									)}
								</ItemGroup>
							)}

							{menuItemLinks['platform'] && this.canShowPlatform() && (
								<ItemGroup key="platform"
								           title={menuItemLinks['platform'].text}
								           className="cp-menu-group">

									{auth.can('manage_customization') && menuItemLinks['platform.customize'] && (
										<Item key="platform.customize">
											<Link to={generatePath(menuItemLinks['platform.customize'].path)}>
												{menuItemLinks['platform.customize'].icon}
												{menuItemLinks['platform.customize'].text}
											</Link>
										</Item>
									)}

									{auth.can("manage_translation") && menuItemLinks['platform.translation'] && (
										<Item key="platform.translation">
											<Link to={generatePath(menuItemLinks['platform.translation'].path)}>
												{menuItemLinks['platform.translation'].icon}
												{menuItemLinks['platform.translation'].text}
											</Link>
										</Item>
									)}

									{auth.can("manage_integration") && menuItemLinks['platform.integration'] && (
										<Item key="platform.integration">
											<Link to={generatePath(menuItemLinks['platform.integration'].path)}>
												{menuItemLinks['platform.integration'].icon}
												{menuItemLinks['platform.integration'].text}
											</Link>
										</Item>
									)}
								</ItemGroup>
							)}

							{menuItemLinks['help'] && (
								<ItemGroup key="help"
								           title={menuItemLinks['help'].text}
								           className="cp-menu-group">

									{menuItemLinks['help.update'] && (
										<Item key="help.update" disabled>
											<Link to={generatePath(menuItemLinks['help.update'].path)}>
												{menuItemLinks['help.update'].icon}
												{menuItemLinks['help.update'].text}
												<span className="ml-auto">
													<Tag color="#87d068">soon</Tag>
												</span>
											</Link>
										</Item>
									)}

									{menuItemLinks['help.documentation'] && (
										<Item key="help.documentation">
											<a href={generatePath(menuItemLinks['help.documentation'].path)}>
												{menuItemLinks['help.documentation'].icon}
												{menuItemLinks['help.documentation'].text}
												<span className="ml-auto">
													<i className="la la-external-link-alt"/>
												</span>
											</a>
										</Item>
									)}

									{menuItemLinks['help.about'] && (
										<Item key="help.about">
											<a href={generatePath(menuItemLinks['help.about'].path)}>
												{menuItemLinks['help.about'].icon}
												{menuItemLinks['help.about'].text}
												<span className="ml-auto">
													<i className="la la-external-link-alt"/>
												</span>
											</a>
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
		windowSize,
	},
	auth
}) => ({
	windowSize,
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

