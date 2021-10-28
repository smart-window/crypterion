import React, {Component} from 'react';
import {Card} from "antd";

class PriceCard extends Component {
	render() {
		const {styleName, name, price} = this.props;

		return (
			<Card className={`${styleName} cp-card-price mb-0`}>
				<h6 className="text-muted">
					{name}
				</h6>
				<h4 className="font-weight-medium">
					{price}
				</h4>
			</Card>
		);
	}
}

export default PriceCard;