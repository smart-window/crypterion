import React, {Component} from 'react';
import Methods from "./components/Methods";
import MethodCategories from "./components/MethodCategories";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {Spin} from "antd";

class Payment extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			methods          : [],
			methodCategories : [],
			loading          : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.settings.marketplace.payment.data');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					methods          : data.methods || [],
					methodCategories : data.method_categories || [],
					loading          : false
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {loading, methodCategories, methods} = this.state;

		return (
			<Spin spinning={loading}>
				<MethodCategories
					onChange={() => this.fetchData()}
					data={methodCategories}/>

				<Methods
					categories={methodCategories}
					onChange={() => this.fetchData()}
					data={methods}/>
			</Spin>
		);
	}
}

export default Payment;