import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "admin/components/Widget";
import {Alert, Button, Form, InputNumber, Spin} from "antd";
import ApiService from "admin/support/Services/Api";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "admin/support/utils/promise";
import {isEmpty} from "lodash";

const messages = defineMessages({
	successful : {
		defaultMessage : "Marketplace updated successfully.",
		id             : "admin.configuration.updated_marketplace_successfully"
	},
});

class Marketplace extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
			loading        : false
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {axios, route} = this.api;
		const {form, intl} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('admin.settings.configuration.marketplace.update');

				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
						this.fetchData()
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	fetchData() {
		const {axios, route} = this.api;
		const {form} = this.props;
		const endpoint = route('admin.settings.configuration.marketplace.data');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({loading : false});
				form.setFieldsValue(data);
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {form} = this.props;
		const {loading, confirmLoading} = this.state;
		const {getFieldDecorator} = form;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Marketplace"
						id="admin.configuration.marketplace"/>
				}>
				<Spin spinning={loading}>
					<Form onSubmit={this.handleSubmit}
                          wrapperCol={{xs : 8, md: 16}}
                          labelCol={{xs : 16, md: 8}}>
						<div className="mb-3">
							<Alert type="info"
							       message={
								       <FormattedMessage
									       defaultMessage={
										       "All amounts are in the base currency {currency}. " +
										       "Conversions are automatically carried out for other currencies using {service}"
									       }
									       values={{
										       service  : <b>Open Exchange Rates API</b>,
										       currency : <b>USD</b>
									       }}
									       id="admin.configuration.offer_amount_info"/>
							       }
							       showIcon/>
						</div>

						<Form.Item labelAlign="left"
						           label={
							           <FormattedMessage
								           defaultMessage="Min Offer Amount"
								           id="admin.configuration.min_offer_amount"/>
						           }>
							{getFieldDecorator("min_offer_amount", {
								rules : [{required : true}],
							})(<InputNumber/>)}
						</Form.Item>

						<Form.Item labelAlign="left"
                                   label={
							           <FormattedMessage
								           defaultMessage="Max Offer Amount"
								           id="admin.configuration.max_offer_amount"/>
						           }>
							{getFieldDecorator("max_offer_amount", {
								rules : [{required : true}],
							})(<InputNumber/>)}
						</Form.Item>

						<div className="mb-3">
							<Alert type="info"
							       message={
								       <FormattedMessage
									       defaultMessage={
										       "Offers from the database are stored in cache per user in order to " +
										       "improve search experience. You may specify the cache period below " +
										       "in minutes."
									       }
									       id="admin.configuration.offer_cache_period_info"/>
							       }
							       showIcon/>
						</div>

						<Form.Item labelAlign="left"
						           label={
							           <FormattedMessage
								           defaultMessage="Offer Cache Period"
								           id="admin.configuration.offer_cache_period"/>
						           }>
							{getFieldDecorator("offer_cache_period", {
								rules : [{required : true}],
							})(<InputNumber/>)}
						</Form.Item>

						<Form.Item className="mb-0">
							<Button type="primary" icon="save"
							        htmlType="submit" loading={confirmLoading}
							        shape="round">
								<span>
									<FormattedMessage
										defaultMessage="Submit"
										id="common.submit"/>
								</span>
							</Button>
						</Form.Item>
					</Form>
				</Spin>
			</Widget>
		);
	}
}

export default pipe(
	formHelper(),
)(Marketplace);
