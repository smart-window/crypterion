import React from "react";
import {FormattedMessage} from "react-intl";

const menuItemLinks = {
	'home' : {
		path : '/admin/home',
		icon : <i className="la la-home"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Home"
					id="common.home"/>
			</span>
		),
	},

	'users' : {
		path : '/admin/users',
		icon : <i className="la la-users"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Users"
					id="common.users"/>
			</span>
		),
	},

	'roles' : {
		path : '/admin/roles',
		icon : <i className="la la-certificate"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Roles"
					id="common.roles"/>
			</span>
		),
	},

	'wallets' : {
		path : '/admin/wallets',
		icon : <i className="la la-wallet"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Wallets"
					id="common.wallets"/>
			</span>
		),
	},

	'settings' : {
		path : '/admin/settings',
		icon : <i className="la la-cog"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Settings"
					id="common.settings"/>
			</span>
		),
	},

	'settings.configuration' : {
		path : '/admin/settings/configuration',
		icon : <i className="la la-cog"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Configuration"
					id="admin.configuration"/>
			</span>
		),
	},

	'settings.marketplace' : {
		path : '/admin/settings/marketplace',
		icon : <i className="la la-business-time"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Marketplace"
					id="admin.marketplace"/>
			</span>
		),
	},

	'settings.notification' : {
		path : '/admin/settings/notification',
		icon : <i className="la la-bell"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Notification"
					id="common.notification"/>
			</span>
		),
	},

	'platform' : {
		path : '/admin/platform',
		icon : <i className="la la-laptop"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Platform"
					id="common.platform"/>
			</span>
		),
	},

	'platform.customize' : {
		path : '/admin/platform/customize',
		icon : <i className="la la-paint-brush"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Customize"
					id="admin.customize"/>
			</span>
		),
	},

	'platform.translation' : {
		path : '/admin/platform/translation',
		icon : <i className="la la-language"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Translation"
					id="admin.translation"/>
			</span>
		),
	},

	'platform.translation.edit' : {
		path : '/admin/platform/translation/:group',
		icon : <i className="la la-language"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Edit"
					id="admin.edit"/>
			</span>
		),
	},

	'platform.integration' : {
		path : '/admin/platform/integration',
		icon :  <i className="la la-code"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Integration"
					id="admin.integration"/>
			</span>
		),
	},

	'help' : {
		path : '/admin/help',
		icon : <i className="la la-question"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Help"
					id="admin.help"/>
			</span>
		),
	},

	'help.update' : {
		path : '/admin/help/update',
		icon : <i className="la la-cloud"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Update"
					id="admin.update"/>
			</span>
		),
	},

	'help.documentation' : {
		path : '//docs.crypterion.live/',
		icon : <i className="la la-book"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="Documentation"
					id="admin.documentation"/>
			</span>
		),
	},

	'help.about' : {
		path : '//crypterion.live/',
		icon : <i className="la la-question-circle"/>,
		text : (
			<span>
				<FormattedMessage
					defaultMessage="About"
					id="admin.about"/>
			</span>
		),
	},
};

export default menuItemLinks;