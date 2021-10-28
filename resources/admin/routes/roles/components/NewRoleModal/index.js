import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {isEmpty, startCase} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import {Alert, Checkbox, Divider, Form, Input, InputNumber, Modal} from "antd";

const messages = defineMessages({
	successful : {
		defaultMessage : "A new role has been created successfully.",
		id             : "admin.roles.create_role_successful"
	},
});

class NewRoleModal extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		}
	}

	handleSubmit = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.roles.create');
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.triggerSuccess(data);
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess(data) {
		const {onSuccess} = this.props;
		if (typeof onSuccess === "function") {
			return onSuccess(data);
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {confirmLoading} = this.state;
		const {visible, onCancel, form, permissions} = this.props;
		const {getFieldDecorator} = form;

		return (
			<Modal visible={visible}
			       confirmLoading={confirmLoading}
			       title={
				       <FormattedMessage
					       defaultMessage="Create Role"
					       id="admin.role.create_role"/>
			       }
			       onCancel={onCancel}
			       onOk={this.handleSubmit}
			       okText={
				       <span>
					       <FormattedMessage
						       defaultMessage="Submit"
						       id="common.submit"/>
				       </span>
			       }>
				<Alert type="info"
				       className="mb-3"
				       message={
					       <FormattedMessage
						       defaultMessage={
							       "The level assigned to a role is used to prioritize user actions."
						       }
						       id="admin.role.level_info"/>
				       }
				       showIcon/>

				<Form.Item labelCol={{xs : 8}}
				           wrapperCol={{xs : 16}}
				           labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Name"
						           id="admin.role.name"/>
				           }>
					{getFieldDecorator("name", {
						rules : [{required : true}],
					})(<Input/>)}
				</Form.Item>

				<Form.Item labelCol={{xs : 8}}
				           wrapperCol={{xs : 16}}
				           labelAlign="left"
				           label={
					           <FormattedMessage
						           defaultMessage="Level"
						           id="admin.role.level"/>
				           }>
					{getFieldDecorator("level", {
						rules : [{required : true}],
					})(
						<InputNumber min={1} max={99}/>
					)}
				</Form.Item>

				<Divider>
					<FormattedMessage
						defaultMessage="Permissions"
						id="common.permissions"/>
				</Divider>

				{permissions.map((permission) => (
					<Form.Item key={permission.id}
					           className="mb-0 mx-3">
						{getFieldDecorator(permission.name, {
							valuePropName : 'checked'
						})(
							<Checkbox>
								{startCase(permission.name)}
							</Checkbox>
						)}
					</Form.Item>
				))}
			</Modal>
		);
	}
}

export default pipe(
	formHelper(),
)(NewRoleModal);