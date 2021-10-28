import React, {Component} from 'react';
import ChartCard from "components/ChartCard";
import {Area, AreaChart, ResponsiveContainer, Tooltip, YAxis} from "recharts";
import ZcashIcon from 'react-cryptocoins/dist/icons/ZEC-alt';
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import {Spin} from "antd";
import {get, isArray, map, mean, round, slice} from "lodash";
import moment from "moment";
import {currencyFormat} from "support/utils/common";

class BitcoinPrice extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			currency       : 'USD',
			price          : 0,
			formattedPrice : "",
			history        : {},
			loading        : false
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('home.widget.price.data', {
			identifier : 'zec'
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					currency       : data.currency || 'USD',
					price          : data.price || 0,
					formattedPrice : data.formatted_price || "",
					history        : data.history || {},
					loading        : false,
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false})
			}));

		this.setState({loading : true})
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	buildAreaChartData = (data) => {
		if (!isArray(data)) return [];

		return map(slice(data, -7), (value) => {
			const price = mean([value.high, value.low]);
			return {
				price : round(price, 2),
				name  : value.time,
				time  : value.time,
			}
		});
	};


	render() {
		const {loading, formattedPrice, history, currency} = this.state;
		const chartData = this.buildAreaChartData(history['Data']);

		const TooltipContent = (props) => {
			const {active, payload} = props;
			if (!active) return null;
			const data = get(payload, '[0].payload');
			return (
				<div className="rounded p-1 cp-bg-white">
					<span className="d-inline-block mr-1">
						{moment.utc(data.time, 'X').local().fromNow()}:
					</span>
					<span className="font-weight-medium d-inline-block">
						{currencyFormat(data.price, currency)}
					</span>
				</div>
			);
		};

		return (
			<Spin spinning={loading}>
				<ChartCard value={formattedPrice}
				           title="Zcash Price"
				           styleName="mb-0"
				           icon={<ZcashIcon style={{color: '#a73932'}}/>}
				           children={
					           <ResponsiveContainer width="100%" height={32}>
						           <AreaChart data={chartData}
						                      margin={{top : 0, right : 0, left : 0, bottom : 0}}>
							           <Tooltip content={<TooltipContent/>}/>
							           <defs>
								           <linearGradient id="zcashColor" x1="0" y1="0" x2="1" y2="0">
									           <stop offset="5%" stopColor="#FF817A" stopOpacity={0.9}/>
									           <stop offset="95%" stopColor="#a73932" stopOpacity={0.9}/>
								           </linearGradient>
							           </defs>
							           <YAxis type="number" domain={['dataMin', 'dataMax']} hide/>
							           <Area dataKey='price'
							                 type='monotone'
							                 strokeWidth={0}
							                 fill="url(#zcashColor)"
							                 fillOpacity={1}/>
						           </AreaChart>
					           </ResponsiveContainer>
				           }/>
			</Spin>
		);
	}
}

export default BitcoinPrice;