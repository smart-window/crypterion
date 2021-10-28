import React, {Component} from 'react';
import CoinPrice from "./components/CoinPrice";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";

class PriceList extends Component {
	constructor(props) {
		super(props);

		this.state = {
			scroll : true
		}
	}

	onMouseOver = () => {
		this.setState({scroll : false})
	};

	onMouseOut = () => {
		this.setState({scroll : true})
	};

	render() {
		const {accounts} = this.props;

		return (
			<div className="marquee my-3"
			     onMouseOver={this.onMouseOver}
			     onMouseOut={this.onMouseOut}>
				<div className={`${this.state.scroll ? '' : 'pause'}`}>
					{accounts.map((account) => (
							<CoinPrice coin={account.wallet.coin.name}
							           key={account.id}
							           styleName="mx-1"
							           price={account.formatted_price}
							           priceColor={account.wallet.coin.color}/>
						)
					)}

				</div>
			</div>
		);
	}
}

const mapStateToProps = ({
	wallet : {accounts},
	auth
}) => ({
	accounts,
	auth : new Auth(auth)
});
export default pipe(
	connect(
		mapStateToProps
	)
)(PriceList);