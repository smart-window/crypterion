import React, {Component} from 'react';
import {Button, Spin, Transfer} from "antd";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {assign, isArray} from "lodash"
import {pipe} from "admin/support/utils/common";

const messages = defineMessages({
	successful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.widget.action_successful"
	},
});

class AdminHome extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			data           : [],
			targetKeys     : [],
			confirmLoading : false,
			loading        : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.customize.widgets.data', {
			category : 'admin.home'
		});
		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				const items = !isArray(data) ? [] :
					data.map((o) => assign({}, o, {key : o.name}));

				const enabled = items.filter(i => i.enabled)
					.map(i => i.key);

				this.setState({data : items, targetKeys : enabled, loading : false});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	toggleEnabled = () => {
		const {axios, route} = this.api;
		const {intl} = this.props;
		const {targetKeys} = this.state;
		const endpoint = route('admin.platform.customize.widgets.toggle-enabled', {
			category : 'admin.home'
		});

		this.setState({confirmLoading : true});

		axios.post(endpoint.url(), {names : targetKeys})
			.then(response => handleSuccess(response, (data) => {
				const items = !isArray(data) ? [] :
					data.map((o) => assign({}, o, {key : o.name}));

				const enabled = items.filter(i => i.enabled)
					.map(i => i.key);

				this.setState({data : items, targetKeys : enabled, confirmLoading : false});
			}, intl.formatMessage(messages.successful)))
			.catch(error => handleError(error, () => {
				this.setState({confirmLoading : false});
			}));
	};

	handleChange = (targetKeys) => {
		this.setState({targetKeys});
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	render() {
		const {data, targetKeys, confirmLoading, loading} = this.state;
		return (
			<React.Fragment>
				<Spin spinning={loading}>
					<Transfer
						dataSource={data}
						onChange={this.handleChange}
						targetKeys={targetKeys}
						titles={[
							<FormattedMessage
								defaultMessage="Available"
								id="admin.available"/>,
							<FormattedMessage
								defaultMessage="Enabled"
								id="admin.enabled"/>
						]}
						filterOption={(search, item) => {
							return item.title.indexOf(search) > -1
						}}
						className="my-3 text-center"
						listStyle={{
							minWidth  : 250,
							width     : "45%",
							height    : 300,
							textAlign : "left"
						}}
						render={item => item.title}
						showSearch/>
				</Spin>

				<Button type="primary" icon="save"
				        shape="round" loading={confirmLoading}
				        onClick={this.toggleEnabled}>
					<span>
						<FormattedMessage
							defaultMessage="Save"
							id="admin.save"/>
					</span>
				</Button>
			</React.Fragment>
		);
	}
}

export default pipe(
	injectIntl,
)(AdminHome);