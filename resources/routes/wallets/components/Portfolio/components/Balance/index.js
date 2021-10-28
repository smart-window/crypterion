import React, {Component} from 'react';
import {pipe} from "support/utils/common";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import {connect} from "react-redux";
import Auth from "support/Auth";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import {Spin} from "antd";

class Balance extends Component {
	constructor(props) {
		super(props);

		this.broadcast = new PrivateBroadcast();
		this.api = new ApiService();

		this.state = {
			availablePrice          : 0,
			formattedAvailablePrice : "0",
			loading                 : false,
		};
	}

	componentDidMount() {
		this.bindBroadcastEvents();
		this.fetchBalance();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('TransferRecordSaved', this.transferRecordSavedListener);
	}

	componentWillUnmount() {
		this.api.cancel();
		this.broadcast.unbind();
	}

	resetBroadcastChannel() {
		const {auth} = this.props;
		if (auth.check()) {
			this.broadcast.setChannel('Auth.User.' + auth.user.id)
		} else {
			this.broadcast.unbind();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const user = this.props.auth.user;
		const prevUser = prevProps.auth.user;

		if (prevUser.id !== user.id) {
			console.log('Updated Balance Component');
			this.resetBroadcastChannel();
		}
	}

	transferRecordSavedListener = (e) => {
		if (e.transferRecord) {
			const transferRecord = e.transferRecord;
			if (transferRecord.confirmed) {
				this.fetchBalance();
			}
		}
	};

	fetchBalance() {
		const {axios, route} = this.api;

		const endpoint = route('user.wallet-account.total-available-price');

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					availablePrice          : data.price,
					formattedAvailablePrice : data.formattedPrice,
					loading                 : false
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));

		this.setState({loading : true});
	}

	render() {
		return (
			<Spin spinning={this.state.loading}>
				<div className="my-2 my-lg-3">
					<div className="mr-2 cp-fs-3x font-weight-medium d-inline-block">
						<span> {this.state.formattedAvailablePrice} </span>
					</div>
				</div>
			</Spin>
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
	)
)(Balance);