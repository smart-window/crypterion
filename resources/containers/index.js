import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchAuthUser, setAuthUser} from "redux/actions/Auth"
import * as ThemeSettings from 'constants/ThemeSettings';
import Master from "./Master";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import {injectIntl} from "react-intl";
import {Icon, message as messageApi, Spin} from "antd";
import {pipe} from "support/utils/common";
import IdleTimer from 'react-idle-timer';
import Auth from "support/Auth";
import ApiService from "../support/Services/Api";
import {fetchAccounts} from "../redux/actions/Wallet";
import {handleError} from "../support/utils/promise";

import {
	fetchCoins,
	fetchCountries,
	fetchCurrencies,
	fetchMarketplaceTags,
	fetchPaymentMethods,
	fetchWallets
} from "../redux/actions/Collections";

import {
	fetchLocaleData,
	setLayoutType,
	setLocale,
	setNavStyle,
	setRecaptchaData,
	setSupportedLocales,
	setThemeType,
	updateWindowSize
} from "../redux/actions/Settings";

export class Container extends Component {
	constructor(props) {
		super(props);
		this.broadcast = new PrivateBroadcast();
		this.api = new ApiService();
	}

	componentDidMount() {
		this.updateNavStyle();
		this.updateLayoutType();
		this.updateThemeType();
		this.initialize();
	}

	initialize() {
		this.setWindowSize();
		this.setSpinDefaultIndicator();
		this.setMessageConfig();
		this.bindEvents();
		this.bindBroadcastEvents();

		this.props.fetchCountries();
		this.props.fetchMarketplaceTags();
		this.props.fetchPaymentMethods();
		this.props.fetchCoins();
		this.props.fetchWallets();
		this.props.fetchCurrencies();

		if (this.props.auth.check()) {
			this.props.fetchAccounts();
		}
	}

	bindEvents() {
		window.addEventListener('resize', this.setWindowSize);
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('UserUpdated', this.userUpdatedListener);
	}

	userUpdatedListener = (e) => {
		this.props.setAuthUser(e.user);
	};

	resetBroadcastChannel() {
		const {auth} = this.props;
		if (auth.check()) {
			this.broadcast.setChannel('Auth.User.' + auth.user.id);
		} else {
			this.broadcast.unbind();
		}
	}

	setSpinDefaultIndicator = () => {
		Spin.setDefaultIndicator(
			<Icon style={{fontSize : 24}}
			      spin type="loading"/>
		);
	};

	setMessageConfig= () => {
		messageApi.config({
			duration: 2,
			maxCount: 1,
		});
	};

	updateLayoutType = () => {
		const layoutType = this.props.layoutType;

		switch (layoutType) {
			case ThemeSettings.LAYOUT_TYPE_FULL:
				document.body.classList.remove('boxed-layout');
				document.body.classList.remove('framed-layout');
				document.body.classList.add('full-layout');
				break;
			case ThemeSettings.LAYOUT_TYPE_FRAMED:
				document.body.classList.remove('boxed-layout');
				document.body.classList.remove('full-layout');
				document.body.classList.add('framed-layout');
				break;
			case ThemeSettings.LAYOUT_TYPE_BOXED:
				document.body.classList.remove('full-layout');
				document.body.classList.remove('framed-layout');
				document.body.classList.add('boxed-layout');
				break;
		}
	};

	updateNavStyle = () => {
		const navStyle = this.props.navStyle;

		switch (navStyle) {
			case ThemeSettings.NAV_STYLE_HORIZONTAL_LIGHT:
			case ThemeSettings.NAV_STYLE_HORIZONTAL_DARK:
			case ThemeSettings.NAV_STYLE_HORIZONTAL_TOP:
			case ThemeSettings.NAV_STYLE_HORIZONTAL_BOTTOM:
			case ThemeSettings.NAV_STYLE_HORIZONTAL_INSIDE:
				document.body.classList.add('horizontal-layout');
				document.body.classList.add('full-scroll');
				break;

			default:
				document.body.classList.remove('horizontal-layout');
				document.body.classList.remove('full-scroll');
				break;
		}
	};

	setWindowSize = () => {
		const {innerWidth, innerHeight} = window;
		this.props.updateWindowSize(innerWidth, innerHeight);
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		const user = this.props.auth.user;
		const prevUser = prevProps.auth.user;

		this.updateLayoutType();
		this.updateNavStyle();
		this.updateThemeType();

		if (prevUser.id !== user.id) {
			console.log('Container Updated');
			this.resetBroadcastChannel();
		}
	}

	updateThemeType = () => {
		const themeType = this.props.themeType;
		if (themeType !== ThemeSettings.THEME_TYPE_DARK) {
			document.body.classList.remove('dark-theme');
		} else {
			document.body.classList.add('dark-theme');
		}
	};

	unbindEvents() {
		window.removeEventListener('resize', this.setWindowSize);
	}

	onActive = (e) => {
		this.setOnline();
	};

	setOnline() {
		if (this.props.auth.check()) {
			const {axios, route} = this.api;
			const endpoint = route('user.set-online');
			axios.post(endpoint.url())
				.catch(error => handleError(error));
		}
	};

	onIdle = (e) => {
		this.setAway();
	};

	setAway() {
		if (this.props.auth.check()) {
			const {axios, route} = this.api;
			const endpoint = route('user.set-away');
			axios.post(endpoint.url())
				.catch(error => handleError(error));
		}
	};

	setOffline() {
		if (this.props.auth.check()) {
			const {axios, route} = this.api;
			const endpoint = route('user.set-offline');
			axios.post(endpoint.url())
				.catch(error => handleError(error));
		}
	};

	componentWillUnmount() {
		this.api.cancel();
		this.broadcast.unbind();
		this.unbindEvents();
	}

	render() {
		return (
			<React.Fragment>
				<IdleTimer
					onIdle={this.onIdle}
					onActive={this.onActive}
					debounce={250}
					timeout={1000 * 60}/>
				<Master/>
			</React.Fragment>
		)
	}
}

const mapStateToProps = ({
	settings : {
		navStyle,
		layoutType,
		themeType
	},
	auth
}) => ({
	themeType,
	navStyle,
	layoutType,
	auth : new Auth(auth),
});

export default pipe(
	injectIntl,
	connect(
		mapStateToProps,
		{
			setLayoutType,
			setNavStyle,
			setThemeType,
			setSupportedLocales,
			setLocale,
			setRecaptchaData,
			fetchLocaleData,
			fetchAuthUser,
			updateWindowSize,
			fetchAccounts,
			fetchCurrencies,
			fetchCountries,
			fetchMarketplaceTags,
			fetchPaymentMethods,
			setAuthUser,
			fetchCoins,
			fetchWallets,
		}
	)
)(Container);
