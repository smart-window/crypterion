import React, {Component} from 'react';
import {map, sumBy} from "lodash";
import 'echarts/lib/chart/pie';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {FormattedMessage, injectIntl} from "react-intl";
import Widget from "components/Widget";
import {Icon, Result} from "antd";
import context from "context";
import activeShape from './activeShape';
import {Pie, PieChart, ResponsiveContainer} from "recharts";

const {colorPalettes} = context.settings;

class Distribution extends Component {
	constructor(props) {
		super(props);

		this.state = {
			activeIndex : 0,
		}
	}

	onPieEnter = (data, index) => {
		this.setState({
			activeIndex : index,
		});
	};

	getData() {
		const {accounts} = this.props;

		return map(accounts, (o) => {
			return {
				value : o.available_price,
				name  : o.wallet.coin.name
			}
		});
	}

	render() {
		const {activeIndex} = this.state;
		const data = this.getData();

		const total = sumBy(data, 'value');

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Wallet Distribution"
						id="wallet.distribution"/>
				}>
				<div className="text-center text-lg-left">
					{total > 0 ? (
						<ResponsiveContainer height={200}>
							<PieChart>
								<Pie dataKey="value"
								     fill={colorPalettes['@primary-color']}
								     activeIndex={activeIndex}
								     activeShape={activeShape}
								     innerRadius="50%"
								     outerRadius="70%"
								     onMouseEnter={this.onPieEnter}
								     data={data}/>
							</PieChart>
						</ResponsiveContainer>
					) : (
						<Result
							icon={
								<Icon type="frown"
								      twoToneColor={colorPalettes['@primary-color']}
								      theme="twoTone"/>
							}
							extra={
								<span className="text-muted">
									<FormattedMessage
										defaultMessage="You have no wallet balance."
										id="wallet.no_wallet_balance"/>
								</span>
							}
							status="info"/>
					)}
				</div>
			</Widget>
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
	injectIntl,
	connect(
		mapStateToProps
	)
)(Distribution);