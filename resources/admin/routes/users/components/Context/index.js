import React, {Component} from 'react';
import {Dropdown, Menu, Select} from "antd";
import Auth from "admin/support/Auth";
import {pipe} from "admin/support/utils/common";
import {FormattedMessage, injectIntl} from "react-intl";
import {connect} from "react-redux";
import {startCase} from "lodash";
import DateInput from "../DateInput";
import RoleSelect from "../RoleSelect";

class Context extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showDateInput  : false,
			showRoleSelect : false
		}
	}

	activateMenu = () => {
		const {status, auth} = this.props;
		if (auth.cannot('manage_users')) return null;
		if (status !== "inactive") return null;

		return (
			<Menu.Item key="unban"
			           onClick={this.activate}>
				<i className="la la-check-circle"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Activate"
						id="common.activate"/>
				</span>
			</Menu.Item>
		);
	};

	toggleDateInputVisibility = () => {
		this.setState(({showDateInput}) => {
			return {
				showDateInput : !showDateInput
			};
		})
	};

	toggleRoleSelectVisibility = () => {
		this.setState(({showRoleSelect}) => {
			return {
				showRoleSelect : !showRoleSelect
			};
		})
	};

	activate = () => {
		const {onActivate, item} = this.props;
		if (onActivate) onActivate(item);
	};

	deactivateMenu = () => {
		const {status, auth} = this.props;
		if (auth.cannot('manage_users')) return null;
		if (status !== "active") return null;

		return (
			<Menu.Item key="ban"
			           onClick={this.toggleDateInputVisibility}>
				<i className="la la-ban"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Deactivate"
						id="common.deactivate"/>
				</span>
			</Menu.Item>
		);
	};

	deactivate = (date) => {
		const {onDeactivate, item} = this.props;

		this.toggleDateInputVisibility();

		if (typeof onDeactivate === "function") {
			return onDeactivate(item, date);
		}
	};

	deleteMenu = () => {
		const {auth} = this.props;
		if (auth.cannot('manage_users')) return null;

		return (
			<Menu.Item key="delete"
			           onClick={this.delete}>
				<i className="la la-trash"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Delete"
						id="common.delete"/>
				</span>
			</Menu.Item>
		)
	};

	delete = () => {
		const {onDelete, item} = this.props;
		if (typeof onDelete === "function") {
			return onDelete(item);
		}
	};

	changeRoleMenu = () => {
		const {auth} = this.props;
		if (auth.cannot('manage_user_roles')) return null;

		return (
			<Menu.Item key="change-role"
			           onClick={this.toggleRoleSelectVisibility}>
				<i className="la la-certificate"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Change Role"
						id="admin.change_role"/>
				</span>
			</Menu.Item>
		)
	};

	changeRole = (roles) => {
		const {onChangeRole, item} = this.props;

		this.toggleRoleSelectVisibility();

		if (typeof onChangeRole === "function") {
			return onChangeRole(item, roles);
		}
	};

	getMenu() {
		return (
			<Menu>
				{this.activateMenu()}
				{this.deactivateMenu()}
				{this.changeRoleMenu()}
				<Menu.Divider/>
				{this.deleteMenu()}
			</Menu>
		);
	}

	canShowContext() {
		const {item, auth} = this.props;

		return item.level < auth.user.level && (
			auth.can('manage_user_roles') ||
			auth.can('manage_users')
		);
	}

	render() {
		const {item, roles, children} = this.props;
		const {showDateInput, showRoleSelect} = this.state;

		if (!this.canShowContext()) return null;

		return (
			<React.Fragment>
				<Dropdown
					trigger={['click']}
					placement="bottomRight"
					overlay={this.getMenu()}
					children={children}/>

				<DateInput
					visible={showDateInput}
					onCancel={this.toggleDateInputVisibility}
					onOk={this.deactivate}
					title={
						<FormattedMessage
							defaultMessage="Specify Expiry Date"
							id="admin.users.specify_expiry_date"/>
					}/>

				<RoleSelect
					visible={showRoleSelect}
					onCancel={this.toggleRoleSelectVisibility}
					onOk={this.changeRole}
					defaultValue={item.all_roles}
					resetOnClose={false}
					title={
						<FormattedMessage
							defaultMessage="Select Roles"
							id="admin.users.select_roles"/>
					}
					options={roles.map((role) => {
						return (
							<Select.Option key={role.name}>
								{startCase(role.name)}
							</Select.Option>
						)
					})}/>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	injectIntl,
	connect(
		mapStateToProps
	)
)(Context);