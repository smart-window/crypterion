import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import PageTabs from "components/PageTabs";
import {Tabs} from "antd";
import CreateBuyOffer from "./components/CreateBuyOffer";
import CreateSellOffer from "./components/CreateSellOffer";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {assign, get} from "lodash";
import context from "context";
import {Helmet} from "react-helmet";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Create Offer - Marketplace | {name}",
		id             : "meta.title.marketplace_create_offer"
	},
});

const {TabPane} = Tabs;

class CreateOffer extends Component {
	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const {location} = this.props;
		let attributes = {};
		const offer = get(location, 'state.offer');

		if (offer && offer.id) {
			if (offer.type === 'sell') {
				attributes = assign(attributes, {defaultActiveKey : 'create_sell_offer'});
			}

			if (offer.type === 'buy') {
				attributes = assign(attributes, {defaultActiveKey : 'create_buy_offer'});
			}
		}

		return (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<PageTabs {...attributes}>
					<TabPane key="create_sell_offer"
					         tab={
						         <span className="d-flex align-items-center">
							         <i className="la la-sign-out-alt cp-fs-xl mr-2"/>
							         <span>
								         <FormattedMessage
									         defaultMessage="Sell Offer"
									         id="marketplace.sell_offer"/>
							         </span>
						         </span>
					         }>
						<CreateSellOffer offer={offer && offer.type === "sell" && offer}/>
					</TabPane>

					<TabPane key="create_buy_offer"
					         tab={
						         <span className="d-flex align-items-center">
							         <i className="la la-sign-in-alt cp-fs-xl mr-2"/>
							         <span>
								         <FormattedMessage
									         defaultMessage="Buy Offer"
									         id="marketplace.buy_offer"/>
							         </span>
						         </span>
					         }>
						<CreateBuyOffer offer={offer && offer.type === "buy" && offer}/>
					</TabPane>
				</PageTabs>
			</React.Fragment>
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
	injectIntl,
)(CreateOffer);