import React, {Component} from "react";
import {Layout} from "antd";
import Header from "../Header";
import Sidebar from "../Sidebar";
import {setThemeType} from "admin/redux/actions/Settings"
import Footer from "../Footer";
import Routes from "admin/routes";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {pipe} from "admin/support/utils/common";

class Master extends Component {
	render() {
		return (
			<Layout className="cp-app-layout">
				<Sidebar/>
				<Layout>
					<Header/>
					<Layout.Content className="cp-layout-content">
						<Routes/>

						<Footer/>
					</Layout.Content>
				</Layout>
			</Layout>
		)
	}
}

const mapStateToProps = ({
	settings : {
		windowSize,
		navStyle
	}
}) => ({
	windowSize,
	navStyle
});

export default pipe(
	injectIntl,
	connect(
		mapStateToProps,
		{
			setThemeType
		}
	)
)(Master);

