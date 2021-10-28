import React from "react";
import {FormattedMessage} from "react-intl";

const menuItemLinks = {
	'auth' : {
		path : '/auth',
		icon : <i className="la la-user"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Auth"
					id="common.auth"/>
			</span>
		),
	},

	'auth.reset_password' : {
		path : '/auth/reset_password',
		icon : <i className="la la-lock"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Reset Password"
					id="common.reset_password"/>
			</span>
		),
	},

	'home' : {
		path : '/home',
		icon : <i className="la la-home"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Home"
					id="common.home"/>
			</span>
		),
	},

	'wallets' : {
		path : '/wallets',
		icon : <i className="la la-wallet"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Wallets"
					id="common.wallets"/>
			</span>
		)
	},

	'marketplace' : {
		path : '/marketplace',
		icon : <i className="la la-business-time"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Marketplace"
					id="common.marketplace"/>
			</span>
		)
	},

	'marketplace.buy_coin' : {
		path : '/marketplace/buy_coin',
		icon : <i className="la la-coins"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Buy Coin"
					id="common.buy_coin"/>
			</span>
		)
	},

	'marketplace.sell_coin' : {
		path : '/marketplace/sell_coin',
		icon : <i className="la la-coins"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Sell Coin"
					id="common.sell_coin"/>
			</span>
		)
	},

	'marketplace.create_offer' : {
		path : '/marketplace/create_offer',
		icon : <i className="la la-plus-square"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Create Offer"
					id="common.create_offer"/>
			</span>
		)
	},

	'marketplace.offer' : {
		path : '/marketplace/offer/:slug',
		icon : <i className="la la-suitcase"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Offer"
					id="common.offer"/>
			</span>
		)
	},

	'chat' : {
		path : '/chat',
		icon : <i className="la la-comment"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Chat List"
					id="common.chat list"/>
			</span>
		)
	},

	'chat.view' : {
		path : '/chat/:token',
		icon : <i className="la la-comment"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Chat"
					id="common.chat"/>
			</span>
		)
	},

	'profile' : {
		path : '/profile/:name',
		icon : <i className="la la-user"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Profile"
					id="common.profile"/>
			</span>
		)
	},

	'profile.contacts' : {
		path : '/profile/:name/contacts',
		icon : <i className="la la-phone"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Contact"
					id="common.contact"/>
			</span>
		)
	},

	'profile.offers' : {
		path : '/profile/:name/offers',
		icon : <i className="la la-suitcase"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Offers"
					id="common.offers"/>
			</span>
		)
	},

	'profile.settings' : {
		path : '/profile/:name/settings',
		icon : <i className="la la-cog"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Settings"
					id="common.settings"/>
			</span>
		)
	},

	'profile.trades' : {
		path : '/profile/:name/trades',
		icon : <i className="la la-exchange-alt"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Trades"
					id="common.trades"/>
			</span>
		)
	},

	'moderation' : {
		path : '/moderation',
		icon : <i className="la la-balance-scale"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Moderation"
					id="common.moderation"/>
			</span>
		)
	},

	'moderation.disputed_trades' : {
		path : '/moderation/disputed_trades',
		icon : <i className="la la-flag"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Disputed Trades"
					id="common.disputed_trades"/>
			</span>
		)
	},
};

export default menuItemLinks;