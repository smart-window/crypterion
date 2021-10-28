import React, {Component} from 'react';
import {pipe} from "admin/support/utils/common";
import {connect} from "react-redux";
import {fetchAuthUser, setAuthUser} from "admin/redux/actions/Auth"
import {injectIntl} from "react-intl";
import Routes from "admin/routes/auth";

class Auth extends Component {
	componentDidMount() {
		this.props.setAuthUser({});
	}

	render() {
		return (
			<Routes/>
		);
	}
}

export default pipe(
	connect(
		null,
		{
			fetchAuthUser,
			setAuthUser,
		}
	),
	injectIntl,
)(Auth);