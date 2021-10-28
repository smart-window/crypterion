import React, {Component} from "react";
import {Button, Col, Spin} from "antd";
import Distribution from "./components/Distribution";
import Balance from "./components/Balance";
import {FormattedMessage} from "react-intl";
import PriceList from "./components/PriceList";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";

import {hideNewAccountForm, showNewAccountForm} from "redux/actions/Wallet"
import {generatePath, Link} from "react-router-dom";
import menuItemLinks from "containers/utils/menuItemLinks";


class Portfolio extends Component {
	showNewAccountForm = () => {
		this.props.showNewAccountForm()
	};

	render() {
		const {accountsLoading} = this.props;

		const sellCoinPath = generatePath(menuItemLinks['marketplace.sell_coin'].path);
		const buyCoinPath = generatePath(menuItemLinks['marketplace.buy_coin'].path);

		return (
			<React.Fragment>
				<Col sm={12} xs={24}>
					<h2 className="h4 text-sm-left text-center">
						<FormattedMessage
							defaultMessage="Your Wallet Balance"
							id="wallet.your_balance"/>
					</h2>

					<div className="text-center">
						<Balance/>

						<div className="text-sm-left mb-3 mt-2 mb-md-2">
							<Link to={buyCoinPath}>
								<Button className="mr-2 cp-btn-success"
								        type="default">
									<i className="la la-sign-in-alt"/>
									<span className="ml-1">
										<FormattedMessage
											defaultMessage="Buy"
											id="common.buy"/>
									</span>
								</Button>
							</Link>

							<Link to={sellCoinPath}>
								<Button className="mr-2" type="danger">
									<i className="la la-sign-out-alt"/>
									<span className="ml-1">
										<FormattedMessage
											defaultMessage="Sell"
											id="common.sell"/>
									</span>
								</Button>
							</Link>
						</div>
					</div>

					<PriceList/>

					<p className="cp-text-primary cp-pointer">
						<Button className="mr-2" type="default"
						        onClick={this.showNewAccountForm}>
							<i className="la la-plus-circle"/>
							<span className="ml-1">
								<FormattedMessage
									defaultMessage="Add Account"
									id="wallet.add_account"/>
							</span>
						</Button>
					</p>
				</Col>


				<Col sm={12} xs={24}>
					<Spin spinning={accountsLoading}>
						<Distribution/>
					</Spin>
				</Col>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	wallet : {
		accountsLoading,
		showNewAccountModal,
		accounts
	}
}) => ({
	accountsLoading,
	showNewAccountModal,
	accounts
});

export default pipe(
	connect(
		mapStateToProps,
		{
			showNewAccountForm,
			hideNewAccountForm
		}
	)
)(Portfolio);

