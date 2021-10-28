import React, {Component} from 'react';
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {Drawer} from "antd";
import {matchPath, withRouter} from "react-router-dom";
import Auth from "support/Auth";
import Empty from "./components/Empty";
import Fullscreen from "react-full-screen";
import Menu from "./components/Menu";
import Body from "./components/Body";
import menuItemLinks from "containers/utils/menuItemLinks";
import context from "context";
import {Helmet} from "react-helmet";
import {defineMessages, injectIntl} from "react-intl";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Chat | {name}",
		id             : "meta.title.chat"
	},
});

class Chats extends Component {
	constructor(props) {
		super(props);

		this.state = {
			drawerState : false,
			fullscreen  : false
		}
	}

	onToggleDrawer = () => {
		this.setState((state) => {
			return {
				drawerState : !state.drawerState,
				fullscreen  : false
			};
		});
	};

	onToggleFullscreen = () => {
		this.setState((state) => {
			return {
				fullscreen  : !state.fullscreen,
				drawerState : false
			};
		})
	};

	onChangeFullscreen = (fullscreen) => {
		this.setState({fullscreen})
	};

	getActiveChatParams = () => {
		const {location} = this.props;

		const match = matchPath(location.pathname, {
			exact  : true,
			path   : menuItemLinks['chat.view'].path,
			strict : false
		});

		return match && match.params;
	};

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const activeChat = this.getActiveChatParams();
		const {drawerState, fullscreen} = this.state;

		const sidebar = <Menu activeChat={activeChat}/>;

		return (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<Fullscreen
					onChange={this.onChangeFullscreen}
					enabled={fullscreen}>
					<div className="cp-app-module cp-chat-module">
						<div className="cp-chat-module-box">
							<div className="d-block d-lg-none">
								<Drawer visible={drawerState}
								        closable={false}
								        onClose={this.onToggleDrawer}
								        placement="left">
									{sidebar}
								</Drawer>
							</div>

							<div className="cp-chat-sidenav d-none d-lg-flex">
								{sidebar}
							</div>

							{activeChat ? (
								<Body key={activeChat.token}
								      onChangeFullscreen={this.onChangeFullscreen}
								      onToggleFullscreen={this.onToggleFullscreen}
								      fullscreen={fullscreen}
								      onToggleDrawer={this.onToggleDrawer}
								      activeChat={activeChat}/>
							) : (
								<Empty onToggleDrawer={this.onToggleDrawer}/>
							)}
						</div>
					</div>
				</Fullscreen>
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
		mapStateToProps,
	),
	injectIntl,
	withRouter
)(Chats);

if (module.hot) {
	module.hot.accept()
}