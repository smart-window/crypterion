import React, {Component} from 'react';
import ApiService from "admin/support/Services/Api";
import {pipe} from "admin/support/utils/common";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {withRouter} from "react-router-dom";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import Widget from "admin/components/Widget";
import {get, mapValues, upperCase} from "lodash";
import {Alert, Button} from "antd";
import AsyncTable from "admin/components/AsyncTable";
import EditKeyModal from "./components/EditKeyModal";
import FilterResult from "./components/FilterResult";

const messages = defineMessages({
	exportSuccessful : {
		defaultMessage : "Translation exported into file.",
		id             : "admin.translation.translation_exported"
	},
});

class Edit extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			locales       : [],
			editKey       : false,
			totalChanged  : 0,
			total         : 0,
			exportLoading : false,
			loading       : false
		}
	}

	clearFilter = () => {
		this.table.clearFilter();
	};

	applyFilter = (filters) => {
		this.table.applyFilter(filters);
	};

	componentDidMount() {
		this.fetchData();
	}

	exportTranslation = () => {
		const {axios, route} = this.api;
		const {intl, match} = this.props;
		const endpoint = route('admin.platform.translation.group-export', {
			group : match.params.group
		});

		this.setState({exportLoading : true});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.setState({exportLoading : false});
			}, intl.formatMessage(messages.exportSuccessful)))

			.catch(error => handleError(error, () => {
				this.setState({exportLoading : false});
			}));
	};

	fetchData() {
		const {axios, route} = this.api;
		const {match} = this.props;
		const endpoint = route('admin.platform.translation.group-data', {
			group : match.params.group
		});
		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					loading      : false,
					locales      : data.locales || [],
					totalChanged : data.total_changed || 0,
					total        : data.total || 0,
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	edit(record) {
		this.editKeyForm.resetFields();

		const fields = mapValues(record, function (o, k) {
			return (k !== "key") ? o.value : o;
		});

		this.editKeyForm.setFieldsValue(fields);
		this.toggleEditKeyModal();
	}

	handleEditSuccess = (item) => {
		this.toggleEditKeyModal();
		this.table.updateItem(item);
	};

	columns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Key"
					id="admin.translation.key"/>,
				dataIndex : 'key',
			},
			{
				title  : <FormattedMessage
					defaultMessage="Default Message"
					id="admin.translation.default_message"/>,
				key    : 'message',
				render : (text, record) => get(record, 'en.value')
			},
			{
				title  : <FormattedMessage
					defaultMessage="Action"
					id="common.action"/>,
				key    : 'action',
				render : (text, record) => (
					<div style={{whiteSpace : 'nowrap'}}>
						<Button className="m-0 mr-2" shape="circle"
						        onClick={(e) => this.edit(record)}
						        type="primary" icon="edit"/>
					</div>
				),
			},
		];
	};

	toggleEditKeyModal = () => {
		this.setState(({editKey}) => {
			return {editKey : !editKey}
		})
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {match} = this.props;
		const {locales, totalChanged, total, editKey, exportLoading} = this.state;
		const {route} = this.api;
		const group = match.params.group;

		const endpoint = route("admin.platform.translation.group-table", {group});

		return (
			<Widget styleName="cp-card-table"
			        title={
				        <FormattedMessage
					        defaultMessage="Edit {group} Keys"
					        id="admin.translation.edit_group_keys"
					        values={{
						        group : <b>{upperCase(group)}</b>
					        }}/>
			        }
			        extra={
				        <span>
					        <span className="d-inline-block mr-2">
						        <FormattedMessage
							        defaultMessage="{total} Total"
							        id="admin.translation.total_details"
							        values={{
								        total : <b>{total}</b>
							        }}/>
					        </span>

					        <span className="d-inline-block mr-2">
						        <FormattedMessage
							        defaultMessage="{total} Changed"
							        id="admin.translation.total_changed_details"
							        values={{
								        total : <b>{totalChanged}</b>
							        }}/>
					        </span>
				        </span>
			        }>
				<EditKeyModal onSuccess={this.handleEditSuccess}
				              locales={locales} group={group}
				              ref={(form) => this.editKeyForm = form}
				              visible={editKey}
				              onCancel={this.toggleEditKeyModal}/>

				<div className="p-3">
					<Alert type="warning"
					       message={
						       <FormattedMessage
							       defaultMessage={
								       "Heads up! Do not change the words that are of the form {first} or {second}. " +
								       "They are called parameters and they are meant to be replaced with a value. " +
								       "e.g :name will be replaced with the actual name of the user."
							       }
							       values={{
								       first  : <b>{":word"}</b>,
								       second : <b>{"{word}"}</b>
							       }}
							       id="admin.translation.edit_keys_warning"/>
					       }
					       showIcon/>
				</div>

				<div className="d-block px-3">
					<FilterResult
						onApply={this.applyFilter}
						onClear={this.clearFilter}/>
				</div>

				<AsyncTable
					columns={this.columns()}
					route={endpoint.url()}
					rowKey="key"
					ref={(table) => this.table = table}
					className="mt-1"
					scroll={{x : true, y : false}}
					size="middle"/>

				<div className="p-3 text-right">
					<Button type="primary" icon="save"
					        loading={exportLoading} shape="round"
					        onClick={this.exportTranslation}>
						<span>
							<FormattedMessage
								defaultMessage="Publish"
								id="common.publish"/>
						</span>
					</Button>
				</div>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
	withRouter
)(Edit);