import React, {Component} from "react";
import {connect} from "react-redux";
import {setAuthUser} from "admin/redux/actions/Auth"
import * as ThemeSettings from 'admin/constants/ThemeSettings';
import Master from "./Master";
import PrivateBroadcast from "admin/support/Services/Broadcast/Private";
import {injectIntl} from "react-intl";
import {Icon, message as messageApi, Spin} from "antd";
import {pipe} from "admin/support/utils/common";
import AuthModel from "admin/support/Auth";
import ApiService from "admin/support/Services/Api";
import {updateWindowSize} from "admin/redux/actions/Settings";
import Auth from "admin/containers/Auth";

import {
	fetchCoins,
	fetchCountries,
	fetchCurrencies,
	fetchMarketplaceTags,
	fetchPaymentMethods,
	fetchWallets
} from "admin/redux/actions/Collections";

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
		document.body.classList.remove('horizontal-layout');
		document.body.classList.remove('full-scroll');
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

	componentWillUnmount() {
		this.api.cancel();
		this.broadcast.unbind();
		this.unbindEvents();
	}

	render() {
		const {auth} = this.props;

		return auth.can('access_control_panel') ?
			<Master/> : <Auth/>;
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
	auth : new AuthModel(auth),
});

export default pipe(
	injectIntl,
	connect(
		mapStateToProps,
		{
			updateWindowSize,
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
