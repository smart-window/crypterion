import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Card} from "antd";
import Footer from "./components/Footer";

class Page extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeTab : "footer"
		}
	}

	handleTabChange = (activeTab) => {
		this.setState({activeTab})
	};

	render() {
		const {activeTab} = this.state;

		const tabList = [
			{
				key : 'footer',
				tab : (
					<span className="d-flex align-items-center">
						<span>
							<FormattedMessage
								defaultMessage="Footer"
								id="admin.footer"/>
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
				{activeTab === 'footer' && <Footer/>}
			</Card>
		);
	}
}

export default Page;