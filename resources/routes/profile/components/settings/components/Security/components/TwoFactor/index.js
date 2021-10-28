import React, {Component} from 'react';
import Widget from "components/Widget";
import {FormattedMessage, injectIntl} from "react-intl";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import Enable from "./components/Enable";
import Request from "./components/Request";
import Configure from "./components/Configure";
import TwoFactorSetting from "../../../../../../../../support/TwoFactorSetting";

class TwoFactor extends Component {
	constructor(props) {
		super(props);

		this.state = {
			secret  : "",
			request : false,
			url     : "",
		};
	}

	handleRequest = (data) => {
		this.setState({
			secret : data.secret,
			url    : data.url,
		})
	};

	enable = () => {
		this.setState({
			secret  : "",
			request : false,
		}, () => {
			this.update()
		})
	};

	update() {
		const {onUserChange} = this.props;
		if (typeof onUserChange === "function") {
			return onUserChange();
		}
	}

	request = () => {
		this.setState({request : true})
	};

	render() {
		const {url, secret, request} = this.state;
		const {user} = this.props;

		const twoFactorSetting = new TwoFactorSetting(user);

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Two Factor"
						id="profile.two_factor"/>
				}
				extra={(twoFactorSetting.enabled() && !request) && (
					<a onClick={this.request}>
						<FormattedMessage
							defaultMessage="Add Device"
							id="profile.two_factor_add_device"/>
					</a>
				)}>

				{(!twoFactorSetting.enabled() || request) ? (
					!secret ? (
						<Request
							onSuccess={this.handleRequest}
							twoFactorEnabled={twoFactorSetting.enabled()}
							user={user}/>
					) : (
						<Enable
							onSuccess={this.enable} user={user}
							twoFactorEnabled={twoFactorSetting.enabled()}
							url={url} secret={secret}/>
					)
				) : (
					<Configure user={user}/>
				)}
			</Widget>
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
	),
	injectIntl,
)(TwoFactor);