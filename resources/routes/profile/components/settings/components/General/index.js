import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import UploadPhoto from "./components/UploadPhoto";
import {connect} from "react-redux";
import {Col, Row} from "antd";
import {injectIntl} from "react-intl";
import Verification from "./components/Verification";
import Preference from "./components/Preference";
import ProfileDetails from "./components/ProfileDetails";

class General extends Component {
	userChange = () => {
		const {onUserChange} = this.props;
		if (typeof onUserChange === "function") onUserChange();
	};

	render() {
		const {user} = this.props;
		return (
			<Row gutter={8}>
				<Col md={12}>
					<Preference
						onUserChange={this.userChange}
						user={user}/>
					<Verification
						onUserChange={this.userChange}
						user={user}/>
				</Col>
				<Col md={12}>
					<UploadPhoto
						onUserChange={this.userChange}
						user={user}/>
					<ProfileDetails
						onUserChange={this.userChange}
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
)(General);