import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {Button, Table} from "antd";
import Widget from "admin/components/Widget";
import NewTagModal from "./components/NewTagModal";
import EditTagModal from "./components/EditTagModal";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import {pick} from "lodash";
import {pipe} from "admin/support/utils/common";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.tags.action_successful"
	},
});

class Tags extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			newTag  : false,
			editTag : false,
			data    : [],
			loading : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('admin.settings.marketplace.tags.list');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false, data});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	toggleNewTagModal = () => {
		this.setState(({newTag}) => {
			return {newTag : !newTag}
		});
	};

	toggleEditTagModal = () => {
		this.setState(({editTag}) => {
			return {editTag : !editTag}
		});
	};


	handleEditTagSuccess = () => {
		this.toggleEditTagModal();
		this.fetchData();
	};

	handleNewTagSuccess = () => {
		this.toggleNewTagModal();
		this.fetchData();
	};

	edit(record) {
		this.editTagForm.resetFields();

		let fields = pick(record, ['name', 'description', 'id']);

		this.editTagForm.setFieldsValue(fields);
		this.toggleEditTagModal();
	}

	delete(tag) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.settings.marketplace.tags.delete', {
			tag : tag.id
		});

		axios.delete(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.fetchData();
			}, intl.formatMessage(messages.actionSuccessful)))
			.catch(error => handleError(error));
	};

	columns = () => {
		return [
			{
				title     : <FormattedMessage
					defaultMessage="Name"
					id="admin.marketplace.name"/>,
				dataIndex : 'name',
			},
			{
				title     : <FormattedMessage
					defaultMessage="Description"
					id="admin.marketplace.description"/>,
				dataIndex : 'description',
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

						<Button className="m-0 mr-2" shape="circle"
						        onClick={() => this.delete(record)}
						        type="danger" icon="delete"/>
					</div>
				),
			},
		];
	};

	render() {
		const {data, loading, newTag, editTag} = this.state;
		return (
			<Widget styleName="cp-card-table"
			        extra={
				        <Button className="m-0" shape="circle"
				                onClick={this.toggleNewTagModal}
				                type="primary" icon="plus"/>
			        }
			        title={
				        <FormattedMessage
					        defaultMessage="Marketplace Tags"
					        id="admin.marketplace_tags"/>
			        }>
				<NewTagModal
					onSuccess={this.handleNewTagSuccess}
					ref={(form) => this.newTagForm = form}
					onCancel={this.toggleNewTagModal}
					visible={newTag}/>

				<EditTagModal
					onSuccess={this.handleEditTagSuccess}
					ref={(form) => this.editTagForm = form}
					onCancel={this.toggleEditTagModal}
					visible={editTag}/>

				<Table className="mt-1"
				       columns={this.columns()}
				       rowKey="id"
				       scroll={{x : true, y : false}}
				       size="middle"
				       dataSource={data}
				       loading={loading}/>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
)(Tags);