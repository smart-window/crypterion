import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import formHelper from "support/Helpers/Form";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import {withRouter} from "react-router-dom";
import Widget from "components/Widget";
import {Button, Col, Divider, Form, Row, Select} from "antd";
import ApiService from "support/Services/Api";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "support/utils/promise";
import {isEmpty, keys} from "lodash";

const {Option, OptGroup} = Select;

const messages = defineMessages({
	successful : {
		defaultMessage : "Your preference was updated successfully!",
		id             : "profile.preference_action_successful"
	},
	currency   : {
		defaultMessage : "Enter your currency...",
		id             : "profile.select_currency_placeholder"
	}
});

class Preference extends Component {

	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			preferenceConfirmLoading    : false,
			notifications               : [],
			notificationsConfirmLoading : false,
		};
	}

	componentDidMount() {
		this.fetchNotifications();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const prevUser = prevProps.user;
		const user = this.props.user;
		if (user.name !== prevUser.name) {
			console.log('Updated Preference Component');
			this.fetchNotifications();
		}
	}

	handlePreferenceSubmit = (e) => {
		e.preventDefault();

		const {form, intl, onUserChange, user} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.update-preference', {
			name : user.name
		});


		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				this.setState({preferenceConfirmLoading : true});

				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({preferenceConfirmLoading : false});

						if (typeof onUserChange === "function") onUserChange();
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({preferenceConfirmLoading : false});
					}));
			}
		});
	};

	handleNotificationSubmit = (e) => {
		e.preventDefault();

		const requestData = new FormData(e.currentTarget);

		const {onUserChange, user, intl} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('user.profile.update-notification-settings', {
			name : user.name
		});

		this.setState({notificationsConfirmLoading : true});

		axios.post(endpoint.url(), requestData)
			.then(response => handleSuccess(response, (data) => {
				this.setState({notificationsConfirmLoading : false});

				if (typeof onUserChange === "function") onUserChange();
			}, intl.formatMessage(messages.successful)))
			.catch(error => handleError(error, () => {
				this.setState({notificationsConfirmLoading : false});
			}));
	};

	fetchNotifications = () => {
		const {axios, route} = this.api;
		const {user} = this.props;

		const endpoint = route('user.profile.notification-settings', {
			name : user.name
		}).url();

		axios.post(endpoint)
			.then(response => handleSuccess(response, (data) => {
				this.setState({notifications : data});
			}))
			.catch(error => handleError(error, () => {
				this.setState({notifications : {}});
			}))
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {getFieldDecorator} = this.props.form;
		const {intl, user, currencies} = this.props;
		const {
			notifications, notificationsConfirmLoading, preferenceConfirmLoading
		} = this.state;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Preference"
						id="profile.preference"/>
				}>
				{notifications.length > 0 && (
					<React.Fragment>
						<Divider>
							<FormattedMessage
								defaultMessage="Notifications"
								id="profile.notifications"/>
						</Divider>

						<Row className="mb-3">
							<Col sm={16} className="d-none d-sm-block">
								<b>
									<FormattedMessage
										defaultMessage="Type"
										id="common.type"/>
								</b>
							</Col>
							<Col sm={8}>
								<div className="d-flex justify-content-around">
									<span>
										<i className="la la-bell cp-fs-xl"/>
									</span>

									<span>
										<i className="la la-envelope cp-fs-xl"/>
									</span>

									<span>
										<i className="la la-phone cp-fs-xl"/>
									</span>
								</div>
							</Col>
						</Row>

						<Form onSubmit={this.handleNotificationSubmit}>
							{notifications.map((notification) => (
								<Row className="mb-2" key={notification.id}>
									<Col sm={16}>
										{notification.description}
									</Col>
									<Col sm={8}>
										<div className="d-flex justify-content-around">
											<span>
												<input type="checkbox"
												       name={`notification[${notification.name}][database]`}
												       defaultChecked={notification.database}
												       disabled={typeof notification.database === "undefined"}
												       value={1}/>
											</span>

											<span>
												<input type="checkbox" className="ant-checkbox"
												       name={`notification[${notification.name}][email]`}
												       defaultChecked={notification.email}
												       disabled={typeof notification.email === "undefined"}
												       value={1}/>
											</span>

											<span>
												<input type="checkbox" className="ant-checkbox"
												       name={`notification[${notification.name}][sms]`}
												       defaultChecked={notification.sms}
												       disabled={typeof notification.sms === "undefined"}
												       value={1}/>
											</span>
										</div>
									</Col>
								</Row>
							))}

							<div className="d-flex justify-content-end mt-3">
								<Button type="primary"
								        loading={notificationsConfirmLoading}
								        className="ml-auto" size="small"
								        htmlType="submit">
									<span>
										<FormattedMessage
											defaultMessage="Update"
											id="common.update"/>
									</span>
								</Button>
							</div>
						</Form>
					</React.Fragment>
				)}

				<Divider>
					<FormattedMessage
						defaultMessage="Others"
						id="common.others"/>
				</Divider>

				<Form onSubmit={this.handlePreferenceSubmit}>
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Currency"
							           id="profile.currency"/>
					           }>
						{getFieldDecorator('currency', {
							initialValue : user.currency,
							rules        : [
								{required : true},
							],
						})(
							<Select optionFilterProp="children"
							        placeholder={intl.formatMessage(messages.currency)}
							        showSearch>
								{keys(currencies).map((code) => (
									<Option key={code} value={code}>
										{currencies[code].name} ({currencies[code].code})
									</Option>
								))}
							</Select>
						)}
					</Form.Item>

					<Form.Item className="d-flex justify-content-end">
						<Button type="primary"
						        loading={preferenceConfirmLoading}
						        className="ml-auto" size="small"
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
	collections : {
		currencies
	},
	auth
}) => ({
	currencies,
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	formHelper(),
	withRouter
)(Preference);