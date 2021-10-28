import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {Button, Table} from "antd";
import Widget from "admin/components/Widget";
import ApiService from "admin/support/Services/Api";
import {pipe} from "admin/support/utils/common";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import EditCategoryModal from "./components/EditCategoryModal";
import NewCategoryModal from "./components/NewCategoryModal";
import {pick} from "lodash";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.marketplace.action_successful"
	},
});


class MethodCategories extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			newCategory  : false,
			editCategory : false,
		}
	}

	toggleEditCategoryModal = () => {
		this.setState(({editCategory}) => {
			return {editCategory : !editCategory}
		})
	};

	toggleNewCategoryModal = () => {
		this.setState(({newCategory}) => {
			return {newCategory : !newCategory}
		})
	};

	edit(record) {
		this.editCategoryForm.resetFields();

		let fields = pick(record, ['name', 'description', 'id']);

		this.editCategoryForm.setFieldsValue(fields);
		this.toggleEditCategoryModal();
	}

	delete(category) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.settings.marketplace.payment.method-categories.delete', {
			category : category.id
		});

		axios.delete(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.triggerChange();
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

	triggerChange() {
		const {onChange} = this.props;
		if (typeof onChange === "function") {
			return onChange()
		}
	}

	handleNewCategorySuccess = () => {
		this.toggleNewCategoryModal();
		this.triggerChange();
	};

	handleEditCategorySuccess = () => {
		this.toggleEditCategoryModal();
		this.triggerChange();
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {data} = this.props;
		const {newCategory, editCategory} = this.state;
		return (
			<Widget styleName="cp-card-table"
			        title={
				        <FormattedMessage
					        defaultMessage="Payment Method Categories"
					        id="admin.marketplace.payment_method_categories"/>
			        }
			        extra={
				        <Button type="primary" shape="circle"
				                onClick={this.toggleNewCategoryModal}
				                className="m-0" icon="plus"/>
			        }>
				<NewCategoryModal
					onSuccess={this.handleNewCategorySuccess}
					ref={(form) => this.newCategoryForm = form}
					onCancel={this.toggleNewCategoryModal}
					visible={newCategory}/>

				<EditCategoryModal
					onSuccess={this.handleEditCategorySuccess}
					ref={(form) => this.editCategoryForm = form}
					onCancel={this.toggleEditCategoryModal}
					visible={editCategory}/>

				<Table className="mt-1"
				       rowKey="id"
				       columns={this.columns()}
				       size="middle"
				       scroll={{x : true, y : false}}
				       dataSource={data}/>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl
)(MethodCategories);