import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import Widget from "admin/components/Widget";
import {isEmpty, upperCase} from "lodash";
import {Alert, Button, Col, Divider, Row, Select, Spin, Table} from "antd";
import {pipe} from "admin/support/utils/common";
import AddLocale from "./components/AddLocale";
import menuItemLinks from "admin/containers/utils/menuItemLinks";
import {generatePath} from "react-router-dom";

const messages = defineMessages({
	importSuccessful : {
		defaultMessage : "Translation imported successfully.",
		id             : "admin.translation.import_action_successful"
	},

	exportSuccessful : {
		defaultMessage : "Translation exported successfully.",
		id             : "admin.translation.export_action_successful"
	},

	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.translation.action_successful"
	}
});

class Home extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			groups        : [],
			selectedGroup : "",
			locales       : [],
			importType    : 1,
			importLoading : false,
			loading       : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.platform.translation.data');
		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					groups  : data.groups || [],
					locales : data.locales || [],
					loading : false
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));

	}

	importTranslation = () => {
		const {axios, route} = this.api;
		const {intl} = this.props;
		const {importType} = this.state;

		const endpoint = route('admin.platform.translation.import');

		axios.post(endpoint.url(), {type : importType})
			.then(response => handleSuccess(response, (data) => {
				this.setState({importLoading : false});
				this.fetchData();
			}, intl.formatMessage(messages.importSuccessful)))
			.catch(error => handleError(error, () => {
				this.setState({importLoading : false});
			}));

		this.setState({importLoading : true});
	};

	removeLocale(record) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.platform.translation.remove-locale');

		axios.post(endpoint.url(), {locale : record.locale})
			.then(response => handleSuccess(response, () => {
				this.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	}

	editSelectedGroup = () => {
		const {selectedGroup} = this.state;
		const {history} = this.props;

		const path = generatePath(menuItemLinks['platform.translation.edit'].path, {
			group : selectedGroup
		});

		if (!isEmpty(history) && selectedGroup) {
			return history.push(path);
		}
	};

	handleGroupSelect = (selectedGroup) => {
		this.setState({selectedGroup})
	};

	handleImportTypeChange = (importType) => {
		this.setState({importType})
	};

	localeTableColumns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Name"
					id="admin.translation.locale_name"/>,
				dataIndex : 'name',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Native"
					id="admin.translation.locale_native"/>,
				dataIndex : 'native',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="common.action"/>,
				key    : 'action',
				render : (text, record) => record.locale !== 'en' && (
					<Button className="m-0" shape="circle"
					        onClick={() => this.removeLocale(record)}
					        type="danger" icon="delete"/>
				),
			},
		];
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {
			locales, groups, selectedGroup,
			importType, importLoading, loading,
		} = this.state;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Translation"
						id="admin.translation"/>
				}>
				<Spin spinning={loading}>
					<Alert type="warning"
					       className="mb-3"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "Publishing all changes made to translation keys may take a while to complete. " +
								       "Please consider using SSH command: {command}. Make sure the web server is granted " +
								       "write permission on the folder {folder} i.e 775."
							       }
							       values={{
								       command : <code>php artisan translations:export</code>,
								       folder  : <code>resource/lang</code>
							       }}
							       id="admin.translation.export_info"/>
					       }
					       showIcon/>

					<Row gutter={8}>
						<Col span={16}>
							<Select value={importType}
							        onChange={this.handleImportTypeChange}
							        className="w-100">
								<Select.Option value={1}>
									<FormattedMessage
										defaultMessage="Replace existing translation."
										id="admin.translation.replace_existing_translation"/>
								</Select.Option>
								<Select.Option value={0}>
									<FormattedMessage
										defaultMessage="Append new translation."
										id="admin.translation.append_new_translation"/>
								</Select.Option>
							</Select>
						</Col>
						<Col span={8}>
							<Button type="default" icon="download"
							        loading={importLoading} shape="round"
							        onClick={this.importTranslation}>
								<span>
									<FormattedMessage
										defaultMessage="Import"
										id="admin.translation.import"/>
								</span>
							</Button>
						</Col>
					</Row>

					<Row gutter={8}>
						<Col span={16}>
							<Select value={selectedGroup}
							        onChange={this.handleGroupSelect}
							        className="w-100">
								{groups.map((group, index) => (
									<Select.Option key={index} value={group}>
										{upperCase(group)}
									</Select.Option>
								))}
							</Select>
						</Col>
						<Col span={8}>
							<Button type="primary" icon="edit"
							        disabled={importLoading} shape="round"
							        onClick={this.editSelectedGroup}>
								<span>
									<FormattedMessage
										defaultMessage="Edit"
										id="admin.translation.edit"/>
								</span>
							</Button>
						</Col>
					</Row>

					<Divider className="my-3 mt-5">
						<FormattedMessage
							defaultMessage="Locale Setup"
							id="admin.translation.locale_setup"/>
					</Divider>

					<Alert type="info"
					       className="mb-3"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "You may add as many language you want your platform to support. " +
								       "Look up the ISO-2 code for the locale and submit it with the form below. " +
								       "All newly added locales, needs to be translated and published before " +
								       "it can be available to the public."
							       }
							       id="admin.translation.locale_info"/>
					       }
					       showIcon/>

					<AddLocale onSuccess={() => this.fetchData()}/>

					<Table className="mt-1"
					       rowKey="regional"
					       columns={this.localeTableColumns()}
					       size="middle"
					       scroll={{x : true, y : false}}
					       dataSource={locales}/>
				</Spin>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl
)(Home);