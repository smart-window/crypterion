import React from "react";
import {connect} from "react-redux";
import {Tooltip} from "antd";
import messages from "./messages";
import {injectIntl} from "react-intl";
import Auth from "support/Auth";
import {Link} from "react-router-dom";

const QuickLinks = ({auth, intl}) => (
	<React.Fragment>
		{auth.check() ?
			<ul className="cp-header-items ml-auto">
				<li>
					<Tooltip title={intl.formatMessage(messages.wallet)}>
						<Link to={`/wallets`}>
							<i className="la la-wallet cp-pointer"/>
						</Link>
					</Tooltip>
				</li>
				<li>
					<Tooltip title={intl.formatMessage(messages.trades)}>
						<Link to={`/profile/${auth.user.name}/trades`}>
							<i className="la la-balance-scale cp-pointer"/>
						</Link>
					</Tooltip>
				</li>
				<li>
					<Tooltip title={intl.formatMessage(messages.contacts)}>
						<Link to={`/profile/${auth.user.name}/contacts`}>
							<i className="la la-address-book cp-pointer"/>
						</Link>
					</Tooltip>
				</li>
				<li>
					<Tooltip title={intl.formatMessage(messages.chats)}>
						<Link to={`/chat`}>
							<i className="la la-comments cp-pointer"/>
						</Link>
					</Tooltip>
				</li>
			</ul> : null
		}
	</React.Fragment>

);

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});


export default connect(
	mapStateToProps
)(injectIntl(QuickLinks))

