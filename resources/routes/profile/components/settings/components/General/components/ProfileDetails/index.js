import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {Button, Form, Input} from "antd";
import ApiService from "support/Services/Api";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import {isEmpty} from "lodash";

const {TextArea} = Input;

const messages = defineMessages({
	successful : {
		defaultMessage : "Your profile was updated successfully!",
		id             : "profile.details_action_successful"
	},
});

class ProfileDetails extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();

		const {form, intl, onUserChange, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.update-details', {
			name : user.name
		});


		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				this.setState({confirmLoading : true});

				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});

						if (typeof onUserChange === "function") onUserChange();
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));
			}
		});
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {intl, user} = this.props;
		const {getFieldDecorator} = this.props.form;
		const {confirmLoading} = this.state;
		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Details"
						id="profile.details"/>
				}>
				<Form onSubmit={this.handleSubmit}>
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="First Name"
							           id="profile.first_name"/>
					           }>
						{getFieldDecorator('first_name', {
							initialValue : user.profile.first_name,
							rules        : [{max : 25}],
						})(<Input/>)}
					</Form.Item>


					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Last Name"
							           id="profile.last_name"/>
					           }>
						{getFieldDecorator('last_name', {
							initialValue : user.profile.last_name,
							rules        : [{max : 25}],
						})(<Input/>)}
					</Form.Item>

					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Bio"
							           id="profile.bio"/>
					           }>
						{getFieldDecorator('bio', {
							initialValue : user.profile.bio,
							rules        : [{max : 1000}],
						})(
							<TextArea autoSize={{minRows : 5}}/>
						)}
					</Form.Item>

					<Form.Item className="d-flex justify-content-end mt-3">
						<Button type="primary"
						        loading={confirmLoading}
						        className="ml-auto"
						        htmlType="submit">
							<span>
								<FormattedMessage
									defaultMessage="Update"
									id="common.update"/>
							</span>
						</Button>
					</Form.Item>
				</Form>
			</Widget>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
	withRouter
)(ProfileDetails);
