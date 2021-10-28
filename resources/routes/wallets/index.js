import React, {Component} from 'react';
import Portfolio from "./components/Portfolio";
import {Col, Row} from "antd";
import {pipe} from "support/utils/common";
import {connect} from 'react-redux';
import PrivateBroadcast from "support/Services/Broadcast/Private";
import NewAccountModal from "./components/NewAccountModal";
import RecordsTable from "./components/RecordsTable";
import AccountsTable from "./components/AccountsTable";
import {fetchAccounts} from "redux/actions/Wallet";
import DepositModal from "./components/DepositModal";
import {fetchAuthUser} from "redux/actions/Auth"
import WithdrawModal from "./components/WithdrawModal";
import {fetchLocaleData} from "redux/actions/Settings";
import Auth from "support/Auth";
import {Helmet} from "react-helmet";
import {defineMessages, injectIntl} from "react-intl";
import context from "context";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Wallets | {name}",
		id             : "meta.title.wallets"
	},
});

class Wallets extends Component {
	constructor(props) {
		super(props);
		this.broadcast = new PrivateBroadcast();
		this.state = {
			recordsTableKey : 'transfer-record'
		};
	}

	componentDidMount() {
		this.bindBroadcastEvents();
		this.fetchAccounts();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('TransferRecordSaved', this.transferRecordSavedListener);
	}

	resetBroadcastChannel() {
		const {auth} = this.props;
		if (auth.check()) {
			this.broadcast.setChannel('Auth.User.' + auth.user.id)
		} else {
			this.broadcast.unbind();
		}
	}

	fetchAccounts = () => {
		this.props.fetchAccounts();
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		const user = this.props.auth.user;
		const prevUser = prevProps.auth.user;

		if (prevUser.id !== user.id) {
			console.log('Wallet Updated');
			this.resetBroadcastChannel();
		}
	}

	transferRecordSavedListener = (e) => {
		if (e.transferRecord && e.transferRecord.confirmed) {
			this.fetchAccounts();
		}

		this.setState({
			recordsTableKey : Math.floor(Math.random() * 100)
		})
	};

	componentWillUnmount() {
		this.broadcast.unbind();
	}

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const {recordsTableKey} = this.state;

		return (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<WithdrawModal
					onSuccess={this.fetchAccounts}/>

				<NewAccountModal
					onSuccess={this.fetchAccounts}/>

				<DepositModal/>

				<Row gutter={8}>
					<Portfolio/>
				</Row>

				<Row gutter={8}>
					<Col lg={12} xs={24}>
						<AccountsTable/>
					</Col>

					<Col lg={12} xs={24}>
						<RecordsTable
							key={recordsTableKey}/>
					</Col>
				</Row>
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
		{
			fetchAuthUser,
			fetchLocaleData,
			fetchAccounts
		}
	),
	injectIntl
)(Wallets);

if (module.hot) {
	module.hot.accept()
}