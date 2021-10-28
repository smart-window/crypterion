import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import Pagination from "admin/support/Helpers/Pagination";
import {Table} from "antd";
import {assign, findIndex, remove} from "lodash";

class AsyncTable extends Component {
	constructor(props) {
		super(props);

		const {route, pagination, filters} = props;
		this.api = new ApiService();
		this.pagination = new Pagination(this.api, route);

		this.state = {
			data       : [],
			pagination : pagination || {},
			filters    : filters || {},
			loading    : false,
		};
	}

	updateItem(item, predicate) {
		const key = this.props.rowKey || "id";
		predicate = typeof predicate !== "function" ? function (o) {
			return o[key] === item[key];
		} : predicate;

		let records = [...this.state.data];
		const index = findIndex(records, predicate);
		if (index >= 0) {
			records[index] = item;
		}
		this.setState({data : records});
	}

	removeItem(item, predicate) {
		const key = this.props.rowKey || "id";
		predicate = typeof predicate !== "function" ? function (o) {
			return o[key] === item[key];
		} : predicate;

		let records = [...this.state.data];
		const index = findIndex(records, predicate);
		if (index >= 0) {
			remove(records, function (v, i) {
				return i === index;
			});
		}
		this.setState({data : records});
	}

	componentDidMount() {
		this.fetchData();
	}

	applyFilter(nextFilters) {
		this.setState(({pagination, filters}) => {
			return {
				pagination : assign(pagination, {current : 1}),
				filters    : assign(filters, nextFilters)
			}
		}, () => {
			this.fetchData()
		});
	}

	clearFilter() {
		this.setState(({pagination}) => {
			return {
				filters    : {},
				pagination : assign(pagination, {current : 1}),
			}
		}, () => {
			this.fetchData()
		});
	}

	fetchData() {
		const {pagination, filters} = this.state;

		this.pagination.fetchData(
			pagination, filters, (page) => {
				this.setState((state) => {
					return {
						pagination : {
							...state.pagination,
							total : typeof page.total !== "undefined" ? page.total : page.meta.total
						},
						data       : page.data,
						loading    : false
					}
				})
			}, () => {
				this.setState({loading : false})
			}
		);
		this.setState({loading : true});
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	handleTableChange = (pagination, filters) => {
		this.setState((state) => {
			return {
				pagination : {
					...state.pagination,
					current : pagination.current
				},
				filters    : {
					...state.filters, ...filters
				},
			}
		}, () => {
			this.fetchData();
		});
	};

	render() {
		const {
			route, pagination, filters, ...otherProps
		} = this.props;

		const {loading, data} = this.state;

		return (
			<Table size="middle" rowKey="id"
			       {...otherProps}
			       pagination={this.state.pagination}
			       onChange={this.handleTableChange}
			       dataSource={data}
			       loading={loading}/>
		);
	}
}

export default AsyncTable;