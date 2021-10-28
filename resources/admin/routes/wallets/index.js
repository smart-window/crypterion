import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import PageTabs from "admin/components/PageTabs";
import {Tabs} from "antd";
import Overview from "./components/Overview";
import Earnings from "./components/Earnings";
import PendingWithdrawal from "./components/PendingWithdrawal";
import Transactions from "./components/Transactions";

const {TabPane} = Tabs;

class Wallets extends Component {
	render() {
		return (
			<PageTabs>
				<TabPane key="environment"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-binoculars cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Overview"
								         id="common.overview"/>
						         </span>
					         </span>
				         }>
					<Overview/>
				</TabPane>

				<TabPane key="pending-withdrawal"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-stamp cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Pending Withdrawal"
								         id="common.pending-withdrawal"/>
						         </span>
					         </span>
				         }>
					<PendingWithdrawal/>
				</TabPane>

                <TabPane key="transactions"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-book cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Transactions"
								         id="common.transactions"/>
						         </span>
					         </span>
				         }>
					<Transactions/>
				</TabPane>

				<TabPane key="earnings"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-funnel-dollar cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Earnings"
								         id="common.earnings"/>
						         </span>
					         </span>
				         }>
					<Earnings/>
				</TabPane>
			</PageTabs>
		);
	}
}

export default Wallets;

if (module.hot) {
	module.hot.accept()
}
