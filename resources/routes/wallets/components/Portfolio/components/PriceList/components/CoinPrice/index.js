import React from 'react';
import {FormattedMessage} from "react-intl";
import {Card} from "antd";

const CoinPrice = ({styleName, coin, price, priceColor}) => {
	return (
		<Card className={`${styleName} cp-card-price d-inline-block`}>
			<h5 className="text-muted">
				<FormattedMessage
					defaultMessage="{coin} Price"
					id="wallet.coin_price"
					values={{coin: coin}}/>
			</h5>
			<div className="cp-fs-2x font-weight-medium">
				<span style={{color : priceColor}}>
					{price}
				</span>
			</div>
		</Card>
	);
};

export default CoinPrice;