import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import PageTabs from "admin/components/PageTabs";
import {Tabs} from "antd";
import Environment from "./components/Environment";
import Marketplace from "./components/Marketplace";
import Notification from "./components/Notification";
import Wallet from "./components/Wallet";

const {TabPane} = Tabs;

class Configuration extends Component {
	render() {
		return (
			<PageTabs>
				<TabPane key="environment"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-globe cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Environment"
								         id="common.environment"/>
						         </span>
					         </span>
				         }>
					<Environment/>
				</TabPane>

                <TabPane key="wallet"
                         tab={
                             <span className="d-flex align-items-center">
						         <i className="la la-wallet cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
                                         defaultMessage="Wallet"
                                         id="common.wallet"/>
						         </span>
					         </span>
                         }>
                    <Wallet/>
                </TabPane>

				<TabPane key="marketplace"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-business-time cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Marketplace"
								         id="common.marketplace"/>
						         </span>
					         </span>
				         }>
					<Marketplace/>
				</TabPane>

				<TabPane key="notification"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-bell cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Notification"
								         id="common.notification"/>
						         </span>
					         </span>
				         }>
					<Notification/>
				</TabPane>
			</PageTabs>
		);
	}
}

export default Configuration;
