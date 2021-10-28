import React, {Component} from 'react';
import {Col, Input, Row} from "antd";
import {round} from "lodash";
import PropTypes from 'prop-types';

class AmountInput extends Component {
	constructor(props) {
		super(props);

		this.state = {
			value : props.value,
			scale : 'price',
		}
	}

	convert = (value, converter, precision) => {
		const input = parseFloat(value);
		if (Number.isNaN(input)) return "";

		const output = converter(input);

		const rounded = round(output, precision);
		return rounded.toString();
	};

	handlePriceChange = (e) => {
		this.setState({
			value : e.target.value, scale : 'price'
		}, () => {
			this.triggerControlChange();
		});
	};

	handleCoinChange = (e) => {
		this.setState({
			value : e.target.value, scale : 'coin'
		}, () => {
			this.triggerControlChange();
		});
	};

	triggerControlChange() {
		const {onChange} = this.props;
		if (typeof onChange !== "function") return;
		const {value, scale} = this.state;

		if (scale === 'coin') {
			const price = this.convert(value, this.toPrice, 2);
			onChange(parseFloat(price));
		} else if (scale === 'price') {
			onChange(parseFloat(value));
		}
	};

	toCoin = (price) => {
		const {unitPrice} = this.props;
		return price / unitPrice;
	};

	toPrice = (coin) => {
		const {unitPrice} = this.props;
		return coin * unitPrice;
	};

	render() {
		const {coinSymbol, currency, precision} = this.props;
		const {value, scale} = this.state;

		const price = scale === 'coin' ?
			this.convert(value, this.toPrice, 2) : value;

		const coin = scale === 'price' ?
			this.convert(value, this.toCoin, precision) : value;

		return (
			<div>
				<Input.Group>
					<Row gutter={8}>
						<Col xs={12} style={{marginBottom : '0'}}>
							<Input addonAfter={coinSymbol}
							       onChange={this.handleCoinChange}
							       value={coin}/>
						</Col>

						<Col xs={12} style={{marginBottom : '0'}}>
							<Input addonAfter={currency}
							       onChange={this.handlePriceChange}
							       value={price}/>
						</Col>
					</Row>
				</Input.Group>
			</div>

		);
	}
}

AmountInput.protoType = {
	coinSymbol : PropTypes.string.isRequired,
	currency   : PropTypes.string.isRequired,
	unitPrice  : PropTypes.number.isRequired,
	precision  : PropTypes.number.isRequired
};

export default AmountInput;