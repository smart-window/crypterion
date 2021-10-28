import React, {Component} from 'react';
import {Checkbox, Col, Divider, Form, Input, Radio, Row, Select} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import {pipe} from "support/utils/common";
import Auth from "support/Auth";
import {connect} from "react-redux";
import OfferInformation from "../OfferInformation";
import {get, keys, upperCase} from "lodash";

const {TextArea} = Input;
const {Option} = Select;

const messages = defineMessages({
	label : {
		defaultMessage : "Maximum of 25 characters...",
		id             : "create_offer.buy_input_label_placeholder"
	},

	country : {
		defaultMessage : "Choose country of offer...",
		id             : "create_offer.buy_select_country_placeholder"
	},

	tags : {
		defaultMessage : "Select up to 3 tags...",
		id             : "create_offer.buy_select_tags_placeholder"
	},
});

class TermsOfTrade extends Component {
	render() {
		const {getFieldDecorator, getFieldValue} = this.props.form;
		const {
			tags, visible, paymentMethod, form,
			intl, accounts, currencies, countries,
			walletAccount, marketplaceFee, auth
		} = this.props;

		return (
			<Row className={`${visible ? 'd-block' : 'd-none'}`}>
				<Col xl={16} className="mb-3">
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Terms"
							           id="create_offer.buy_input_terms_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "This will be shown to seller before starting a trade"
							           }
							           id="create_offer.buy_input_terms_extra"/>
					           }>
						{getFieldDecorator('terms', {
							rules : [
								{required : true},
							],
						})(
							<TextArea autoSize={{minRows : 5}}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Instruction"
							           id="create_offer.buy_input_instruction_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "This will be shown to seller after starting a trade"
							           }
							           id="create_offer.buy_input_instruction_extra"/>
					           }>
						{getFieldDecorator('instructions', {
							rules : [
								{required : true},
							],
						})(
							<TextArea autoSize={{minRows : 5}}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Label"
							           id="create_offer.buy_input_label_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "This will appear after your payment method"
							           }
							           id="create_offer.buy_input_label_extra"/>
					           }>
						{getFieldDecorator('label', {
							rules : [
								{required : true, max : 25},
							],
						})(
							<Input placeholder={intl.formatMessage(messages.label)}/>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Tags"
							           id="create_offer.buy_select_tags_label"/>
					           }
					           extra={
						           <FormattedMessage
							           defaultMessage={
								           "This is used to improve search presence of your offer."
							           }
							           id="create_offer.buy_select_tags_extra"/>
					           }>
						{getFieldDecorator('tags', {
							rules : [
								{required : true},
							],
						})(
							<Select showSearch mode="multiple"
							        placeholder={intl.formatMessage(messages.tags)}
							        optionFilterProp="children">
								{tags.map((tag) => (
									<Option key={tag.id} value={tag.name}>
										{tag.name}
									</Option>
								))}
							</Select>
						)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Country"
							           id="create_offer.buy_select_country_label"/>
					           }>
						{getFieldDecorator('country', {
							initialValue : get(auth.user, 'location.iso_code'),
							rules : [
								{required : true},
							],
						})(
							<Select showSearch
							        placeholder={intl.formatMessage(messages.country)}
							        optionFilterProp="children">
								{keys(countries).map((code) => (
									<Option key={code} value={upperCase(code)}>
										{countries[code]}
									</Option>
								))}
							</Select>
						)}
					</Form.Item>

					<Divider>
						<FormattedMessage
							defaultMessage="Privacy"
							id="create_offer.buy_privacy"/>
					</Divider>

					<Form.Item>
						{getFieldDecorator('privacy', {
							initialValue : 'none',
						})(
							<Radio.Group>
								<Radio value="none" className="d-block my-3">
									<FormattedMessage
										defaultMessage="None"
										id="create_offer.buy_filter_none"/>
								</Radio>
								<Radio value="all_contacts" className="d-block my-3">
									<FormattedMessage
										defaultMessage="Show your contacts only"
										id="create_offer.buy_filter_all_contacts"/>
								</Radio>
								<Radio value="trusted_contacts" className="d-block my-3">
									<FormattedMessage
										defaultMessage="Show your trusted contacts only"
										id="create_offer.buy_filter_trusted_contacts"/>
								</Radio>
							</Radio.Group>
						)}
					</Form.Item>

					<Divider>
						<FormattedMessage
							defaultMessage="Requirements"
							id="create_offer.buy_requirements"/>
					</Divider>

					<Form.Item className="mb-1">
						{getFieldDecorator('require_phone_verification', {
							valuePropName : 'checked',
							initialValue  : true
						})(
							<Checkbox>
								<FormattedMessage
									defaultMessage="Require Phone Verification"
									id="create_offer.buy_require_phone_verification"/>
							</Checkbox>
						)}
					</Form.Item>

					<Form.Item className="mb-1">
						{getFieldDecorator('require_email_verification', {
							valuePropName : 'checked',
							initialValue  : true
						})(
							<Checkbox>
								<FormattedMessage
									defaultMessage="Require Email Verification"
									id="create_offer.buy_require_email_verification"/>
							</Checkbox>
						)}
					</Form.Item>
				</Col>

				<Col xl={8}>
					<div className="px-xl-3 ml-xl-3 cp-border-left-xl">
						<h1>
							<FormattedMessage
								defaultMessage="About this page"
								id="create_offer.buy_about_page"/>
						</h1>
						<p className="text-justify">
							<FormattedMessage
								defaultMessage={
									"When a customer clicks into your offer, your terms and " +
									"instructions will tell them what to provide during the trade."
								}
								id="create_offer.buy_terms_of_trade_information"/>
						</p>

						<p className="text-justify">
							<FormattedMessage
								defaultMessage={
									"You also have the option of moderating who is able to see " +
									"and who is able to start trade with your offer."
								}
								id="create_offer.buy_filter_requirements_information"/>
						</p>

						<div className="mt-4">
							<OfferInformation marketplaceFee={marketplaceFee}
							                  paymentMethod={paymentMethod}
							                  walletAccount={walletAccount}
							                  form={form}/>
						</div>
					</div>
				</Col>
			</Row>
		);
	}
}

const mapStateToProps = ({
	auth,
	collections : {
		currencies,
		countries
	},
	wallet      : {
		accounts
	},
}) => ({
	accounts,
	auth : new Auth(auth),
	currencies,
	countries
});

export default pipe(
	connect(
		mapStateToProps
	)
)(TermsOfTrade);
