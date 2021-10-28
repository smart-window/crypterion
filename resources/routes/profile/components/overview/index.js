import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import Verification from "./components/Verification";
import Biography from "./components/Biography";
import {Col, Row} from "antd";
import Header from "./components/Header";
import {handleError, handleSuccess} from "support/utils/promise";
import About from "./components/About";
import MarketplaceReviews from "components/MarketplaceReviews";
import ApiService from "support/Services/Api";
import PageNotFound from "components/PageNotFound";
import {isEmpty} from "lodash";
import Loading from "components/Loading";
import {defineMessages, injectIntl} from "react-intl";
import context from "context";
import {Helmet} from "react-helmet";
import AmountTraded from "./components/AmountTraded";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "{user}'s Profile | {name}",
		id             : "meta.title.profile_overview"
	},
});

class Overview extends Component {
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
			console.log('Updated Overview Component');
			this.fetchUser();
		}
	}

	fetchUser = () => {
		const {axios, route} = this.api;
		const {match} = this.props;
		this.setState({loading : true});

		const endpoint = route('user.get', {
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

	onAddContact = () => {
		this.fetchUser();
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	onRemoveContact = () => {
		this.fetchUser();
	};

	getPageTitle() {
		const {intl} = this.props;
		const {user} = this.state;

		return intl.formatMessage(messages.pageTitle, {
			user : user.name,
			name : context.name
		})
	}

	render() {
		const {loading, user} = this.state;

		return !isEmpty(user) ? (
			<div className="animated fadeIn">
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<Header onAddContact={this.onAddContact}
				        onRemoveContact={this.onRemoveContact}
				        user={user}/>

				<div className="cp-profile-content">
					<Row>
						<Col xl={16} lg={14} md={14}>
							<About user={user}/>
                            <AmountTraded user={user}/>
                            <Biography user={user}/>
						</Col>

						<Col xl={8} lg={10} md={10}>
							<Verification user={user}/>
							<MarketplaceReviews user={user}/>
						</Col>
					</Row>
				</div>
			</div>
		) : !loading ? (
			<PageNotFound/>
		) : (
			<Loading/>
		);
	}
}

const mapStateToProps = ({
	collections : {
		currencies
	},
	auth
}) => ({
	currencies,
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	injectIntl
)(Overview);
