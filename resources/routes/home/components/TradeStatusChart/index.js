import React, {Component} from 'react';
import {Pie, PieChart, ResponsiveContainer} from "recharts";
import activeShape from './activeShape';
import Widget from "components/Widget";
import {FormattedMessage} from "react-intl";
import {sumBy} from "lodash";
import {Icon, Result, Spin} from "antd";
import context from "context";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";

const {colorPalettes} = context.settings;

class TradeStatusChart extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			data        : [],
			activeIndex : 0,
			loading     : false
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('home.widget.marketplace-statistics.trade-status-data');

		this.setState({loading : true});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false, data});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false})
			}));
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	onPieEnter = (data, index) => {
		this.setState({
			activeIndex : index,
		});
	};

	render() {
		const {data, activeIndex, loading} = this.state;
		const total = sumBy(data, 'value');

		return (
			<Widget styleName="full-grid-item"
			        title={
				        <FormattedMessage
					        defaultMessage="Trades Status Chart"
					        id="home.widget.marketplace_trade_chart"/>
			        }>
				{(total > 0 && !loading) ? (
					<ResponsiveContainer>
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
					<Spin spinning={loading}>
						<Result
							icon={
								<Icon type="frown"
								      twoToneColor={colorPalettes['@primary-color']}
								      theme="twoTone"/>
							}
							extra={
								<span className="text-muted">
									<FormattedMessage
										defaultMessage="No Marketplace Trade Yet."
										id="widget.trade_chart.no_marketplace_trade"/>
								</span>
							}
							status="info"/>
					</Spin>
				)}
			</Widget>
		);
	}
}

export default TradeStatusChart;