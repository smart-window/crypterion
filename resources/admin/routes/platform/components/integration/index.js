import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import PageTabs from "admin/components/PageTabs";
import {Tabs} from "antd";
import OAuth from "./components/OAuth";

const {TabPane} = Tabs;

class Integration extends Component {
	render() {
		return (
			<PageTabs>
				<TabPane key="oauth"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-cubes cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="OAuth"
								         id="common.oauth"/>
						         </span>
					         </span>
				         }>
					<OAuth/>
				</TabPane>
			</PageTabs>
		);
	}
}

export default Integration;