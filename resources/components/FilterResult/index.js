import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import {Button, Form, InputNumber, Select} from "antd";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {groupBy, isEmpty, keys, upperCase, values} from "lodash";
import {connect} from "react-redux";

const {Option, OptGroup} = Select;

const messages = defineMessages({
	country : {
		defaultMessage : "Select country...",
		id             : "filter_result.select_country_placeholder"
	},

	coin : {
		defaultMessage : "Select coin...",
		id             : "filter_result.select_coin_placeholder"
	},

	currency : {
		defaultMessage : "Select currency...",
		id             : "filter_result.select_currency_placeholder"
	},

	paymentMethod : {
		defaultMessage : "Select payment method...",
		id             : "filter_result.select_payment_method_placeholder"
	},

	tags : {
		defaultMessage : "Filter by tags...",
		id             : "filter_result.select_tags_placeholder"
	},

	amount : {
		defaultMessage : "Filter by amount...",
		id             : "filter_result.input_amount_placeholder"
	},
});

class FilterResult extends Component {
	applyFilter = () => {
		const {onApplyFilter, form} = this.props;

		form.validateFields((errors, values) => {
			if (typeof onApplyFilter === "function" && isEmpty(errors)) {
				return onApplyFilter(values);
			}
		});
	};

	clearFilter = () => {
		const {onClearFilter, form} = this.props;

		form.resetFields();

		if (typeof onClearFilter === "function") {
			return onClearFilter();
		}
	};

	render() {
		const {getFieldDecorator, getFieldsValue} = this.props.form;
		const {intl, currencies, countries, wallets, paymentMethods, marketplaceTags} = this.props;
		const hasFilter = values(getFieldsValue()).some(x => x);

		const groupedPaymentMethods = groupBy(paymentMethods, (o) => {
			return o.category.name;
		});

		return (
			<Form className="p-1">
				<Form.Item className="mb-3"
				           label={
					           <FormattedMessage
						           defaultMessage="By Coin"
						           id="marketplace.filter_by_coin"/>
				           }>
					{getFieldDecorator('coin_identifier')(
						<Select optionFilterProp="children"
						        placeholder={intl.formatMessage(messages.coin)}
						        showSearch style={{width : '100%'}}>
							{wallets.map((wallet) => (
								<Option key={wallet.coin.id} value={wallet.coin.identifier}>
									{wallet.coin.name}
								</Option>
							))}
						</Select>
					)}
				</Form.Item>

				<Form.Item className="mb-3"
				           label={
					           <FormattedMessage
						           defaultMessage="By Currency"
						           id="marketplace.filter_by_currency"/>
				           }>
					{getFieldDecorator('currency')(
						<Select optionFilterProp="children"
						        placeholder={intl.formatMessage(messages.currency)}
						        showSearch style={{width : '100%'}}>
							{keys(currencies).map((code) => (
								<Option key={code} value={upperCase(code)}>
									{currencies[code].name} ({currencies[code].code})
								</Option>
							))}
						</Select>
					)}
				</Form.Item>

				<Form.Item className="mb-3"
				           label={
					           <FormattedMessage
						           defaultMessage="By Country"
						           id="marketplace.filter_by_country"/>
				           }>
					{getFieldDecorator('country')(
						<Select optionFilterProp="children"
						        placeholder={intl.formatMessage(messages.country)}
						        showSearch style={{width : '100%'}}>
							{keys(countries).map((code) => (
								<Option key={code} value={upperCase(code)}>
									{countries[code]}
								</Option>
							))}
						</Select>
					)}
				</Form.Item>

				<Form.Item className="mb-3"
				           label={
					           <FormattedMessage
						           defaultMessage="By Payment Method"
						           id="marketplace.filter_by_payment_method"/>
				           }>
					{getFieldDecorator('payment_method_id')(
						<Select optionFilterProp="children"
						        placeholder={intl.formatMessage(messages.paymentMethod)}
						        showSearch style={{width : '100%'}}>
							{keys(groupedPaymentMethods).map((category, index) => (
								<OptGroup key={index} label={category}>
									{groupedPaymentMethods[category].map((method) => (
										<Option key={method.id} value={method.id}>
											{method.name}
										</Option>
									))}
								</OptGroup>
							))}
						</Select>
					)}
				</Form.Item>

				<Form.Item className="mb-3"
				           label={
					           <FormattedMessage
						           defaultMessage="By Tags"
						           id="marketplace.filter_by_tags"/>
				           }>
					{getFieldDecorator('tags')(
						<Select optionFilterProp="children"
						        placeholder={intl.formatMessage(messages.tags)}
						        showSearch mode="tags"
						        style={{width : '100%'}}>
							{marketplaceTags.map((tag) => (
								<Option key={tag.id} value={tag.name}>
									{tag.name}
								</Option>
							))}
						</Select>
					)}
				</Form.Item>

				<Form.Item className="mb-3"
				           label={
					           <FormattedMessage
						           defaultMessage="Amount"
						           id="marketplace.filter_amount"/>
				           }>
					{getFieldDecorator('amount')(
						<InputNumber style={{width : '100%'}}
						             placeholder={intl.formatMessage(messages.amount)}
						             min={1} step={1}/>
					)}
				</Form.Item>

				<Form.Item className="mt-3 mb-0">
					<Button type="primary" onClick={this.applyFilter} block>
						<FormattedMessage
							defaultMessage="Apply Filter"
							id="filter_result.apply_filter"/>
					</Button>
				</Form.Item>

				{hasFilter && (
					<Form.Item className="mt-0">
						<Button type="default" onClick={this.clearFilter} block>
							<FormattedMessage
								defaultMessage="Clear Filter"
								id="filter_result.clear_filter"/>
						</Button>
					</Form.Item>
				)}
			</Form>
		)
	}
}

const mapStateToProps = ({
	settings    : {
		layoutType
	},
	collections : {
		currencies,
		marketplaceTags,
		wallets,
		paymentMethods,
		countries,
	},
}) => ({
	layoutType,
	marketplaceTags,
	wallets,
	countries,
	paymentMethods,
	currencies,
});


export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
)(FilterResult);