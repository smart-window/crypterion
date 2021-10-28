import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {Col, Row} from "antd";
import TwoFactor from "./components/TwoFactor";
import Password from "./components/Password";

class Security extends Component {
	changeUser = () => {
		const {onUserChange} = this.props;
		if (typeof onUserChange === "function"){
			return onUserChange();
		}
	};

	render() {
		const {user} = this.props;
		return (
			<Row gutter={8}>
				<Col md={12}>
					<Password
						onUserChange={this.changeUser}
						user={user}/>
				</Col>
				<Col md={12}>
					<TwoFactor
						onUserChange={this.changeUser}
						user={user}/>
				</Col>
			</Row>
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
	injectIntl
)(Security);