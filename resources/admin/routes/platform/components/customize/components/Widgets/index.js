import React, {Component} from 'react';
import {Card} from "antd";
import {FormattedMessage} from "react-intl";
import UserHome from "./components/UserHome"
import AdminHome from "./components/AdminHome"

class Widgets extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab : "index.home"
		}
	}

	handleTabChange = (activeTab) => {
		this.setState({activeTab})
	};

	render() {
		const {activeTab} = this.state;

		const tabList = [
			{
				key : 'index.home',
				tab : (
					<span className="d-flex align-items-center">
						<span>
							<FormattedMessage
								defaultMessage="User Home"
								id="admin.user_home"/>
						</span>
					</span>
				)
			},
			{
				key : 'admin.home',
				tab : (
					<span className="d-flex align-items-center">
						<span>
							<FormattedMessage
								defaultMessage="Admin Home"
								id="admin.admin_home"/>
						</span>
					</span>
				)
			}
		];

		return (
			<Card className="cp-card-widget"
			      onTabChange={this.handleTabChange}
			      tabList={tabList}
			      activeTabKey={activeTab}>
				{activeTab === "admin.home" && <AdminHome/>}
				{activeTab === "index.home" && <UserHome/>}
			</Card>
		);
	}
}

export default Widgets;