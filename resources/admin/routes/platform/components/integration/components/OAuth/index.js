import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import Widget from "admin/components/Widget";
import {Alert, Button, Table} from "antd";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {pipe} from "admin/support/utils/common";
import NewClientModal from "./components/NewClientModal";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.integration.oauth_action_successful"
	},
});

class OAuth extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			newClient : false,
			data      : [],
			loading   : false
		}
	}

	componentDidMount() {
		this.fetchClients();
	}

	fetchClients() {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.integration.oauth.client-list');
		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({data, loading : false});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));

	}

	deleteClient(client) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.platform.integration.oauth.client-delete', {
			client : client.id
		});

		axios.delete(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.fetchClients();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	}

	columns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Name"
					id="admin.integration.oauth_client_name"/>,
				dataIndex : 'name',
			},
			{
				title     : <FormattedMessage
					defaultMessage="ID"
					id="admin.integration.oauth_client_id"/>,
				dataIndex : 'id',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Client Secret"
					id="admin.integration.oauth_client_secret"/>,
				dataIndex : 'secret',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="common.action"/>,
				key    : 'action',
				render : (text, record) => (
					<Button className="m-0" shape="circle"
					        onClick={(e) => this.deleteClient(record)}
					        type="danger" icon="delete"/>
				),
			},
		];
	};

	toggleNewClientModal = () => {
		this.setState(({newClient}) => {
			return {newClient : !newClient}
		})
	};

	handleNewClientSuccess = () => {
		this.toggleNewClientModal();
		this.fetchClients();
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {loading, data, newClient} = this.state;

		return (
			<Widget styleName="cp-card-table"
			        title={
				        <FormattedMessage
					        defaultMessage="OAuth Clients"
					        id="admin.integration.oauth_clients"/>
			        }
			        extra={
				        <Button type="primary" shape="circle"
				                onClick={this.toggleNewClientModal}
				                className="m-0" icon="plus"/>
			        }>
				<div className="p-3">
					<Alert type="info"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "The OAuth2 password grant allows your other first-party clients, " +
								       "such as a mobile application, to obtain an access token using an " +
								       "e-mail address / username and password. You should refer to the " +
								       "documentation for the available API endpoints and their responses."
							       }
							       id="admin.integration.oauth_info"/>
					       }
					       showIcon/>
				</div>

				<NewClientModal
					onCancel={this.toggleNewClientModal}
					onSuccess={this.handleNewClientSuccess}
					visible={newClient}/>

				<Table className="mt-1"
				       rowKey="id"
				       columns={this.columns()}
				       loading={loading}
				       size="middle"
				       scroll={{x : true, y : false}}
				       dataSource={data}/>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl
)(OAuth);