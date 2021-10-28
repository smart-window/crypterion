import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import PageTabs from "components/PageTabs";
import {Tabs} from "antd";
import General from "./components/General";
import Security from "./components/Security";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import {withRouter} from "react-router-dom";
import {isEmpty} from "lodash";
import PageNotFound from "components/PageNotFound";
import Loading from "components/Loading";
import context from "context";
import {Helmet} from "react-helmet";
// import Developer from "./components/Developer";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Settings - Profile | {name}",
		id             : "meta.title.profile_settings"
	},
});

const {TabPane} = Tabs;

class Settings extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			user    : {},
			loading : false
		};
	}

	componentDidMount() {
		this.fetchUser();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const prevMatchParams = prevProps.match.params;
		const matchParams = this.props.match.params;
		if (matchParams.name !== prevMatchParams.name) {
			console.log('Updated Settings Component');
			this.fetchUser();
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	fetchUser = () => {
		const {axios, route} = this.api;
		const {match} = this.props;
		this.setState({loading : true});

		const endpoint = route('user.data', {
			name : match.params.name
		}).url();

		axios.post(endpoint)
			.then(response => handleSuccess(response, (data) => {
				this.setState({user : data, loading : false});
			}))
			.catch(error => handleError(error, () => {
				this.setState({user : {}, loading : false});
			}))
	};

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const {loading, user} = this.state;

		return !isEmpty(user) ? (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<PageTabs>
					<TabPane key="general"
					         tab={
						         <span className="d-flex align-items-center">
							         <i className="la la-cog cp-fs-xl mr-2"/>
							         <span>
								         <FormattedMessage
									         defaultMessage="General"
									         id="profile.general"/>
							         </span>
						         </span>
					         }>
						<General user={user} onUserChange={() => this.fetchUser()}/>
					</TabPane>

					<TabPane key="security"
					         tab={
						         <span className="d-flex align-items-center">
							         <i className="la la-shield-alt cp-fs-xl mr-2"/>
							         <span>
								         <FormattedMessage
									         defaultMessage="Security"
									         id="profile.security"/>
							         </span>
						         </span>
					         }>
						<Security user={user} onUserChange={() => this.fetchUser()}/>
					</TabPane>


				</PageTabs>
			</React.Fragment>
		) : !loading ? (
			<PageNotFound/>
		) : (
			<Loading/>
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
	withRouter,
	injectIntl
)(Settings);


// {/*<TabPane key="developer"*/}
// {/*         tab={*/}
// {/*             <span className="d-flex align-items-center">*/}
// {/*							         <i className="la la-puzzle-piece cp-fs-xl mr-2"/>*/}
// {/*							         <span>*/}
// {/*								         <FormattedMessage*/}
// {/*                                             defaultMessage="Developer"*/}
// {/*                                             id="profile.developer"/>*/}
// {/*							         </span>*/}
// {/*						         </span>*/}
// {/*         }>*/}
// {/*    <Developer user={user}/>*/}
// {/*</TabPane>*/}
