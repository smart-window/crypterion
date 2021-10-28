import React, {Component} from 'react';
import {handleError} from "admin/support/utils/promise";
import {pipe} from "admin/support/utils/common";
import {connect} from "react-redux";
import {assign, keys} from "lodash";
import {FormattedMessage} from "react-intl";
import {Alert, Divider, Radio} from "antd";
import Widget from "admin/components/Widget";
import {setLayoutType, setNavStyle, setThemeType} from "admin/redux/actions/Settings";
import ColorPicker from "./components/ColorPicker";
import ApiService from "admin/support/Services/Api";

import {
	LAYOUT_TYPE_BOXED,
	LAYOUT_TYPE_FRAMED,
	LAYOUT_TYPE_FULL,
	NAV_STYLE_HORIZONTAL_BOTTOM,
	NAV_STYLE_HORIZONTAL_DARK,
	NAV_STYLE_HORIZONTAL_INSIDE,
	NAV_STYLE_HORIZONTAL_LIGHT,
	NAV_STYLE_HORIZONTAL_TOP,
	NAV_STYLE_VERTICAL_DRAWER,
	NAV_STYLE_VERTICAL_FIXED,
	NAV_STYLE_VERTICAL_MINI_SIDEBAR,
	THEME_TYPE_DARK,
	THEME_TYPE_LITE,
	THEME_TYPE_SEMI_DARK
} from "admin/constants/ThemeSettings";

class Template extends Component {
	constructor(props) {
		super(props);
		const {colorPalettes} = props;

		this.state = {
			colorPalettes : assign({}, colorPalettes, this.getStoreValue())
		};

		this.api = new ApiService();
	}

	updateLayoutType(layoutType) {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.customize.template.set-layout-type');
		axios.post(endpoint.url(), {
			type : layoutType
		})
			.catch(error => handleError(error));
	}

	updateNavStyle(navStyle) {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.customize.template.set-nav-style');
		axios.post(endpoint.url(), {
			style : navStyle
		})
			.catch(error => handleError(error));
	}

	updateColorPalettes(colorPalettes) {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.customize.template.set-color-palettes');
		axios.post(endpoint.url(), {
			palettes : colorPalettes
		})
			.catch(error => handleError(error));
	}

	updateThemeType(themeType) {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.customize.template.set-theme-type');
		axios.post(endpoint.url(), {
			type : themeType
		})
			.catch(error => handleError(error));
	}

	onThemeTypeChange = (e) => {
		this.props.setThemeType(e.target.value);
		this.updateThemeType(e.target.value)
	};

	onNavStyleChange = (navStyle) => {
		this.props.setNavStyle(navStyle);
		this.updateNavStyle(navStyle);
	};

	onLayoutTypeChange = (layoutType) => {
		this.props.setLayoutType(layoutType);
		this.updateLayoutType(layoutType);
	};

	getStoreValue() {
		let value = {};
		if (typeof sessionStorage !== "undefined") {
			try {
				value = JSON.parse(sessionStorage.getItem(this.getStorageKey()));
			} catch (e) {
				console.warn(e)
			}
		}
		return value;
	}

	setStoreValue(value) {
		if (typeof sessionStorage !== "undefined") {
			try {
				sessionStorage.setItem(this.getStorageKey(), JSON.stringify(value))
			} catch (e) {
				console.warn(e)
			}
		}
	}

	onColorPaletteChange = (name, color) => {
		const {colorPalettes} = this.state;
		colorPalettes[name] = color;

		this.setState({colorPalettes});
		this.updateColorPalettes(colorPalettes);
		this.modifyVars(colorPalettes);
		this.setStoreValue(colorPalettes);
	};

	getStorageKey = () => {
		return 'color-palettes';
	};

	modifyVars(colorPalettes) {
		if (typeof window !== "undefined") {
			window.less
				.modifyVars(colorPalettes)
				.catch(error => {
					console.error(error);
				})
		}
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	render() {
		const {colorPalettes} = this.state;
		const {themeType, navStyle, layoutType} = this.props;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Template"
						id="admin.customize.template"/>
				}>
				<Alert type="info"
				       message={
					       <FormattedMessage
						       defaultMessage={
							       "Some customizations require reloading to effect changes. " +
							       "You should make changes while considering users experience!"
						       }
						       id="admin.customize.template_info"/>
				       }
				       showIcon/>
				<Divider>
					<FormattedMessage
						defaultMessage="Theme"
						id="common.theme"/>
				</Divider>

				<div className="text-center">
					<Radio.Group value={themeType}
					             onChange={this.onThemeTypeChange}>
						<Radio.Button value={THEME_TYPE_LITE}>
							<FormattedMessage
								defaultMessage="Lite"
								id="theme.lite"/>
						</Radio.Button>
						<Radio.Button value={THEME_TYPE_SEMI_DARK}>
							<FormattedMessage
								defaultMessage="Semi Dark"
								id="theme.semi_dark"/>
						</Radio.Button>
						<Radio.Button value={THEME_TYPE_DARK}>
							<FormattedMessage
								defaultMessage="Dark"
								id="theme.dark"/>
						</Radio.Button>
					</Radio.Group>
				</div>

				<Divider className="mt-5">
					<FormattedMessage
						defaultMessage="Color Palettes"
						id="admin.color_palettes"/>
				</Divider>

				<div className="text-center">
					{keys(colorPalettes).map(name => {
						return (
							<ColorPicker
								color={colorPalettes[name]}
								key={name}
								onChange={(color) => this.onColorPaletteChange(name, color)}
								name={name}/>
						)
					})}
				</div>


				<Divider className="mt-5">
					<FormattedMessage
						defaultMessage="Nav Style"
						id="admin.nav_style"/>
				</Divider>

				<div className="text-center cp-nav-option">
					<span className={`m-2 ${navStyle === NAV_STYLE_VERTICAL_FIXED && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_VERTICAL_FIXED)}>
						<img src={require('assets/images/layouts/nav_style_vertical_fixed.png')} alt="Vertical Fixed"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_VERTICAL_MINI_SIDEBAR && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_VERTICAL_MINI_SIDEBAR)}>
						<img src={require('assets/images/layouts/nav_style_vertical_mini_sidebar.png')} alt="Vertical Mini Sidebar"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_VERTICAL_DRAWER && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_VERTICAL_DRAWER)}>
						<img src={require('assets/images/layouts/nav_style_vertical_drawer.png')} alt="Vertical Drawer"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_HORIZONTAL_TOP && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_HORIZONTAL_TOP)}>
						<img src={require('assets/images/layouts/nav_style_horizontal_top.png')} alt="Horizontal Top"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_HORIZONTAL_BOTTOM && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_HORIZONTAL_BOTTOM)}>
						<img src={require('assets/images/layouts/nav_style_horizontal_bottom.png')} alt="Horizontal Bottom"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_HORIZONTAL_DARK && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_HORIZONTAL_DARK)}>
						<img src={require('assets/images/layouts/nav_style_horizontal_dark.png')} alt="Horizontal Dark"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_HORIZONTAL_INSIDE && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_HORIZONTAL_INSIDE)}>
						<img src={require('assets/images/layouts/nav_style_horizontal_inside.png')} alt="Horizontal Inside"/>
					</span>
					<span className={`m-2 ${navStyle === NAV_STYLE_HORIZONTAL_LIGHT && 'active'}`}
					      onClick={(e) => this.onNavStyleChange(NAV_STYLE_HORIZONTAL_LIGHT)}>
						<img src={require('assets/images/layouts/nav_style_horizontal_light.png')} alt="Horizontal Light"/>
					</span>
				</div>

				<Divider className="mt-5">
					<FormattedMessage
						defaultMessage="Layout Type"
						id="admin.layout_type"/>
				</Divider>

				<div className="text-center cp-layout-option">
					<span className={`m-2 ${layoutType === LAYOUT_TYPE_BOXED && 'active'}`}
					      onClick={(e) => this.onLayoutTypeChange(LAYOUT_TYPE_BOXED)}>
						<img src={require('assets/images/layouts/layout_type_boxed.png')} alt="Boxed"/>
					</span>
					<span className={`m-2 ${layoutType === LAYOUT_TYPE_FRAMED && 'active'}`}
					      onClick={(e) => this.onLayoutTypeChange(LAYOUT_TYPE_FRAMED)}>
						<img src={require('assets/images/layouts/layout_type_framed.png')} alt="Framed"/>
					</span>
					<span className={`m-2 ${layoutType === LAYOUT_TYPE_FULL && 'active'}`}
					      onClick={(e) => this.onLayoutTypeChange(LAYOUT_TYPE_FULL)}>
						<img src={require('assets/images/layouts/layout_type_full.png')} alt="Full"/>
					</span>
				</div>
			</Widget>
		);
	}
}

const mapStateToProps = ({
	settings : {
		themeType,
		colorPalettes,
		navStyle,
		layoutType,
	},
}) => ({
	themeType,
	colorPalettes,
	navStyle,
	layoutType,
});

export default pipe(
	connect(
		mapStateToProps,
		{
			setThemeType,
			setNavStyle,
			setLayoutType
		}
	),
)(Template);