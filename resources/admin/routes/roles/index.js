import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import Widget from "admin/components/Widget";
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {Button, Table} from "antd";
import {pipe} from "admin/support/utils/common";
import EditRoleModal from "./components/EditRoleModal";
import {assign, filter, forEach, map, pick} from "lodash";
import NewRoleModal from "./components/NewRoleModal";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.role.action_successful"
	},
});

class Roles extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			newRole     : false,
			editRole    : false,
			roles       : [],
			permissions : [],
			loading     : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.roles.data');

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					roles       : data.roles || [],
					permissions : data.permissions || [],
					loading     : false
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));

		this.setState({loading : true});
	}

	delete(role) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.roles.delete', {
			role : role.id
		});

		axios.delete(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	};

	edit(record) {
		const {permissions} = this.state;
		this.editRoleForm.resetFields();

		const names = map(permissions, 'name');

		const rolePermissions = filter(record.permissions, (o) => {
			return names.includes(o.name);
		});

		let fields = pick(record, ['name', 'level', 'id']);

		forEach(rolePermissions, (o) => {
			fields = assign(fields, {[o.name] : true})
		});
		this.editRoleForm.setFieldsValue(fields);
		this.toggleEditRoleModal();
	}

	columns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Name"
					id="admin.roles.name"/>,
				dataIndex : 'name',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Level"
					id="admin.roles.level"/>,
				dataIndex : 'level',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Total Users"
					id="admin.roles.total_users"/>,
				dataIndex : 'users_count',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="common.action"/>,
				key    : 'action',
				render : (text, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						<Button className="m-0 mr-2" shape="circle"
						        onClick={() => this.edit(record)}
						        type="primary" icon="edit"/>

						<Button className="m-0" shape="circle"
						        onClick={() => this.delete(record)}
						        type="danger" icon="delete"/>
					</div>
				),
			},
		];
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	toggleNewRoleModal = () => {
		this.setState(({newRole}) => {
			return {newRole : !newRole}
		})
	};

	toggleEditRoleModal = () => {
		this.setState(({editRole}) => {
			return {editRole : !editRole}
		})
	};

	handleEditRoleSuccess = () => {
		this.toggleEditRoleModal();
		this.fetchData();
	};


	handleNewRoleSuccess = () => {
		this.toggleNewRoleModal();
		this.fetchData();
	};

	render() {
		const {roles, permissions, loading, newRole, editRole} = this.state;

		return (
			<Widget styleName="cp-card-table"
			        extra={
				        <Button className="m-0" shape="circle"
				                onClick={this.toggleNewRoleModal}
				                type="primary" icon="plus"/>
			        }
			        title={
				        <FormattedMessage
					        defaultMessage="Manage Roles"
					        id="admin.manage_roles"/>
			        }>
				<EditRoleModal permissions={permissions}
				               onSuccess={this.handleEditRoleSuccess}
				               ref={(form) => this.editRoleForm = form}
				               visible={editRole}
				               onCancel={this.toggleEditRoleModal}/>

				<Table className="mt-1"
				       columns={this.columns()}
				       rowKey="id"
				       scroll={{x : true, y : false}}
				       size="middle"
				       dataSource={roles}
				       loading={loading}/>

				<NewRoleModal permissions={permissions}
				              onSuccess={this.handleNewRoleSuccess}
				              ref={(form) => this.newRoleForm = form}
				              visible={newRole}
				              onCancel={this.toggleNewRoleModal}/>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl
)(Roles);

if (module.hot) {
	module.hot.accept()
}