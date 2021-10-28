import React, {Component} from 'react';
import formHelper from "installer/support/Helpers/Form";
import {Button, Col, Form, Icon, Input, Row} from "antd";
import {FormattedMessage} from "react-intl";
import {pipe} from "installer/support/utils/common";
import {handleFormError, handleFormSuccess} from "installer/support/utils/promise";
import {isEmpty} from "lodash";
import ApiService from "installer/support/Services/Api";

class License extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {axios, route} = this.api;
		const endpoint = route('installer.license.verify');
		const {form} = this.props;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({confirmLoading : false});
						this.triggerSuccess(values);
					}))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	triggerSuccess(data) {
		const {onVerify} = this.props;
		if (typeof onVerify === "function") {
			return onVerify(data);
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {confirmLoading} = this.state;
		const {visible, form, documentation} = this.props;
		const {getFieldDecorator} = form;

		return (
			<div className={`${visible ? 'd-block' : 'd-none'}`}>
				<div className="text-center mb-4">
					<h1>
						<FormattedMessage
							defaultMessage="License Verification"
							id="installer.license_verification"/>
					</h1>
				</div>

				<Row>
					<Col xl={16} className="mb-3">
						<Form onSubmit={this.handleSubmit}
						      wrapperCol={{xs : 24, sm : 16}}
						      labelCol={{xs : 24, sm : 8}}>
							<Form.Item labelAlign="left"
							           label={
								           <FormattedMessage
									           defaultMessage="Purchase Code"
									           id="installer.purchase_code"/>
							           }>
								{getFieldDecorator('code', {
									rules : [
										{required : true},
									],
								})(
									<Input prefix={<Icon type="key"/>}/>
								)}
							</Form.Item>

							<Form.Item labelAlign="left"
							           label={
								           <FormattedMessage
									           defaultMessage="Email"
									           id="installer.email"/>
							           }>
								{getFieldDecorator('email', {
									rules : [
										{required : true, type : 'email'},
									],
								})(
									<Input id="license-email"
									       prefix={<Icon type="mail"/>}/>
								)}
							</Form.Item>

							<Form.Item className="mt-4 text-right">
								<Button htmlType="submit"
								        type="primary" shape="round"
								        loading={confirmLoading}>
									<span>
										<FormattedMessage
											defaultMessage="Verify"
											id="installer.verify"/>
									</span>
								</Button>
							</Form.Item>
						</Form>
					</Col>

					<Col xl={8}>
						<div className="px-xl-3 ml-xl-3 cp-border-left-xl">
							<h2>
								<FormattedMessage
									defaultMessage="About this page"
									id="installer.about_page"/>
							</h2>

							<p className="text-justify">
								<FormattedMessage
									defaultMessage={
										"Welcome to {app} installer. We attempt to verify your license code against " +
										"your email and your domain. The license is registered with this domain at " +
										"the final stage of this installation after which you will only be able to " +
										"reinstall on this domain in the future."
									}
									values={{
										app: <b>Crypterion</b>
									}}
									id="installer.license_information"/>
							</p>

							<p className="text-center my-3">
								<Button type="default" shape="round"
								        href={documentation}
								        size="large" icon="file-word">
									<span>
										<FormattedMessage
											defaultMessage="Documentation"
											id="installer.documentation"/>
									</span>
								</Button>
							</p>
						</div>
					</Col>
				</Row>
			</div>
		);
	}
}

export default pipe(
	formHelper()
)(License);