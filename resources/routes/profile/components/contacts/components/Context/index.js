import React, {Component} from 'react';
import {Dropdown, Menu} from "antd";
import {FormattedMessage, injectIntl} from "react-intl";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";

class Context extends Component {
	trustContact = () => {
		const {status, auth} = this.props;
		if (status === 'block') return null;

		return !status ? (
			<Menu.Item key="trust"
			           onClick={this.trust}>
				<i className="la la-star"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Trust"
						id="profile.trust"/>
				</span>
			</Menu.Item>
		) : status === 'trust' && (
			<Menu.Item key="untrust"
			           onClick={this.resetStatus}>
				<i className="la la-star-o"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Untrust"
						id="profile.untrust"/>
				</span>
			</Menu.Item>
		);
	};

	blockContact = () => {
		const {status, auth} = this.props;
		if (status === 'trust') return null;

		return !status ? (
			<Menu.Item key="block"
			           onClick={this.block}>
				<i className="la la-ban"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Block"
						id="profile.block"/>
				</span>
			</Menu.Item>
		) : status === 'block' && (
			<Menu.Item key="unblock"
			           onClick={this.resetStatus}>
				<i className="la la-check-circle"/>
				<span className="ml-1">
					<FormattedMessage
						defaultMessage="Unblock"
						id="profile.unblock"/>
				</span>
			</Menu.Item>
		);
	};

	deleteContact = () => {
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
		);
	};

	delete = () => {
		const {onDelete, item} = this.props;
		if (onDelete) onDelete(item);
	};

	trust = () => {
		const {onTrust, item} = this.props;
		if (onTrust) onTrust(item);
	};

	block = () => {
		const {onBlock, item} = this.props;
		if (onBlock) onBlock(item);
	};

	resetStatus = () => {
		const {onResetStatus, item} = this.props;
		if (onResetStatus) onResetStatus(item);
	};

	getMenu() {
		return (
			<Menu>
				{this.trustContact()}
				{this.blockContact()}
				<Menu.Divider/>
				{this.deleteContact()}
			</Menu>
		);
	};

	render() {
		const {children} = this.props;
		return (
			<Dropdown trigger={['click']}
			          placement="bottomRight"
			          overlay={this.getMenu()}
			          children={children}/>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	injectIntl
)(Context);