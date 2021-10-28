import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import PageTabs from "admin/components/PageTabs";
import {Spin, Tabs} from "antd";
import Template from "./components/Template";

const {TabPane} = Tabs;

class Notification extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			data    : [],
			loading : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.settings.notification.templates.list');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false, data});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	handleSmsUpdate = (item) => {
		this.fetchData();
	};

	handleDatabaseUpdate = (item) => {
		this.fetchData();
	};

	handleEmailUpdate = (item) => {
		this.fetchData();
	};

	render() {
		const {loading, data} = this.state;

		return (
			<div>
				<Spin spinning={loading}>
					<PageTabs>
						{data.map((notification) => (
							<TabPane key={notification.name}
							         tab={
								         <span className="d-flex align-items-center">
									         <span>
										         {notification.title}
									         </span>
								         </span>
							         }>
								<Template onSmsUpdate={this.handleSmsUpdate}
								          onDatabaseUpdate={this.handleDatabaseUpdate}
								          onEmailUpdate={this.handleEmailUpdate}
								          notification={notification}/>
							</TabPane>
						))}
					</PageTabs>
				</Spin>
			</div>

		);
	}
}

export default Notification;