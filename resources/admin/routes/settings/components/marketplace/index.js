import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import PageTabs from "admin/components/PageTabs";
import {Tabs} from "antd";
import Payment from "./components/Payment";
import Tags from "./components/Tags";

const {TabPane} = Tabs;

class Marketplace extends Component {
	render() {
		return (
			<PageTabs>
				<TabPane key="payment-methods"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-credit-card cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Payment"
								         id="common.payment"/>
						         </span>
					         </span>
				         }>
					<Payment/>
				</TabPane>

				<TabPane key="offer-tags"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-tags cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Offer Tags"
								         id="common.offer_tags"/>
						         </span>
					         </span>
				         }>
					<Tags/>
				</TabPane>
			</PageTabs>
		);
	}
}

export default Marketplace;