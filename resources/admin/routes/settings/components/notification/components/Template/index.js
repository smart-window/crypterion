import React, {Component} from 'react';
import {Alert, Card, Icon, Popover} from "antd";
import {isEmpty} from "lodash";
import {FormattedMessage} from "react-intl";
import SmsMessages from "./components/SmsMessages";
import EmailMessages from "./components/EmailMessages";
import DatabaseMessages from "./components/DatabaseMessages";

class Template extends Component {
	constructor(props) {
		super(props);

		const tabList = this.tabList();

		this.state = {
			activeTab : !isEmpty(tabList) && tabList[0].key
		}
	}

	tabList() {
		const {notification} = this.props;
		const list = [];

		if (!isEmpty(notification.email_messages)) {
			list.push({
				key : 'email',
				tab : (
					<span className="d-flex align-items-center">
						<i className="la la-envelope cp-fs-xl mr-2"/>
						<span>
							<FormattedMessage
								defaultMessage="Email"
								id="common.email"/>
						</span>
					</span>
				)
			})
		}

		if (!isEmpty(notification.sms_messages)) {
			list.push({
				key : 'sms',
				tab : (
					<span className="d-flex align-items-center">
						<i className="la la-phone cp-fs-xl mr-2"/>
						<span>
							<FormattedMessage
								defaultMessage="SMS"
								id="common.sms"/>
						</span>
					</span>
				)
			})
		}

		if (!isEmpty(notification.database_messages)) {
			list.push({
				key : 'database',
				tab : (
					<span className="d-flex align-items-center">
						<i className="la la-bell cp-fs-xl mr-2"/>
						<span>
							<FormattedMessage
								defaultMessage="Database"
								id="common.database"/>
						</span>
					</span>
				)
			})
		}
		return list;
	}

	updateSms = (item) => {
		const {onSmsUpdate} = this.props;
		if (typeof onSmsUpdate === "function") {
			return onSmsUpdate(item)
		}
	};

	updateDatabase = (item) => {
		const {onDatabaseUpdate} = this.props;
		if (typeof onDatabaseUpdate === "function") {
			return onDatabaseUpdate(item)
		}
	};

	updateEmail = (item) => {
		const {onEmailUpdate} = this.props;
		if (typeof onEmailUpdate === "function") {
			return onEmailUpdate(item)
		}
	};

	handleTabChange = (activeTab) => {
		this.setState({activeTab})
	};

	render() {
		const {activeTab} = this.state;
		const {notification} = this.props;

		return (
			<Card className="cp-card-widget"
			      activeTabKey={activeTab}
			      onTabChange={this.handleTabChange}
			      tabList={this.tabList()}>
				{activeTab === "email" && (
					<EmailMessages
						template={notification.id}
						data={notification.email_messages}
						onUpdate={this.updateEmail}/>
				)}

				{activeTab === "database" && (
					<DatabaseMessages
						template={notification.id}
						data={notification.database_messages}
						onUpdate={this.updateDatabase}/>
				)}

				{activeTab === "sms" && (
					<SmsMessages
						template={notification.id}
						data={notification.sms_messages}
						onUpdate={this.updateSms}/>
				)}

				{!isEmpty(notification.parameters) && (
					<div className="mt-3">
						<Alert type="info"
						       message={
							       <span>
								       <FormattedMessage
									       defaultMessage="Parameters"
									       id="admin.notification.parameters"/>
							       </span>
						       }
						       description={
							       <span>
								       {notification.parameters.map((data, index) => (
									       <span key={index} className="d-inline-block mr-3">
										       <span className="font-weight-medium mr-1">
											       {data.key}
										       </span>
										       <Popover content={data.name}
										                overlayStyle={{maxWidth : 250}}
										                trigger="click">
											       <Icon type="question-circle" theme="filled"/>
										       </Popover>
									       </span>
								       ))}
							       </span>
						       }
						       showIcon/>
					</div>
				)}
			</Card>
		);
	}
}

export default Template;