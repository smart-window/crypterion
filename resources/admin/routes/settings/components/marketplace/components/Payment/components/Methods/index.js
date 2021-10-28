import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {Button, Table} from "antd";
import Widget from "admin/components/Widget";
import ApiService from "admin/support/Services/Api";
import {pipe} from "admin/support/utils/common";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import NewMethodModal from "./components/NewMethodModal";
import EditMethodModal from "./components/EditMethodModal";
import {assign, forEach, pick} from "lodash";

const messages = defineMessages({
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.marketplace.action_successful"
	},
});

class Methods extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			newMethod  : false,
			editMethod : false,
		}
	}

	toggleNewMethodModal = () => {
		this.setState(({newMethod}) => {
			return {newMethod : !newMethod}
		})
	};

	toggleEditMethodModal = () => {
		this.setState(({editMethod}) => {
			return {editMethod : !editMethod}
		})
	};

	edit(record) {
		this.editMethodForm.resetFields();

		let fields = pick(record, ['name', 'description', 'id']);
		fields['category'] = record.category_id;

		forEach(record.wallet_fees, (o) => {
			fields = assign(fields, {
				[o.wallet.coin.identifier] : o.marketplace_fee
			})
		});
		this.editMethodForm.setFieldsValue(fields);
		this.toggleEditMethodModal();
	}

	delete(method) {
		const {axios, route} = this.api;
		const {intl} = this.props;

		const endpoint = route('admin.settings.marketplace.payment.methods.delete', {
			method : method.id
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
					defaultMessage="Category"
					id="admin.marketplace.category"/>,
				key    : 'category',
				render : (text, record) => {
					return record.category.name
				}
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

	handleNewMethodSuccess = () => {
		this.toggleNewMethodModal();
		this.triggerChange();
	};

	handleEditMethodSuccess = () => {
		this.toggleEditMethodModal();
		this.triggerChange();
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {data, categories} = this.props;
		const {newMethod, editMethod} = this.state;
		return (
			<Widget styleName="cp-card-table"
			        title={
				        <FormattedMessage
					        defaultMessage="Payment Methods"
					        id="admin.marketplace.payment_methods"/>
			        }
			        extra={
				        <Button type="primary" shape="circle"
				                onClick={this.toggleNewMethodModal}
				                className="m-0" icon="plus"/>
			        }>


				<EditMethodModal
					categories={categories}
					onSuccess={this.handleEditMethodSuccess}
					ref={(form) => this.editMethodForm = form}
					onCancel={this.toggleEditMethodModal}
					visible={editMethod}/>

				<Table className="mt-1"
				       rowKey="id"
				       columns={this.columns()}
				       size="middle"
				       scroll={{x : true, y : false}}
				       dataSource={data}/>

				<NewMethodModal
					categories={categories}
					onSuccess={this.handleNewMethodSuccess}
					ref={(form) => this.newMethodForm = form}
					onCancel={this.toggleNewMethodModal}
					visible={newMethod}/>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
)(Methods);