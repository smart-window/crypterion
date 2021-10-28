import React, {Component} from 'react';
import {Button, Form, Spin} from "antd";
import {defineMessages, FormattedMessage} from "react-intl";
import Editor from "admin/components/Editor";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import ApiService from "admin/support/Services/Api";
import {get, isEmpty} from "lodash";
import {handleError, handleFormError, handleFormSuccess, handleSuccess} from "admin/support/utils/promise";

const messages = defineMessages({
	successful : {
		defaultMessage : "Footer updated successfully.",
		id             : "admin.customize.updated_footer_successfully"
	},
});

class Footer extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			confirmLoading : false,
			loading        : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const {form} = this.props;
		const endpoint = route('admin.platform.customize.page.footer.data');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				const body = get(data, 'body');

				if (typeof body === "string") {
					form.setFieldsValue({body});
				}

				this.setState({loading : false});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {form, intl} = this.props;
		const {axios, route} = this.api;

		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				const endpoint = route('admin.platform.customize.page.footer.update');

				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, (data) => {
						this.setState({confirmLoading : false});
					}, intl.formatMessage(messages.successful)))
					.catch(error => handleFormError(error, form, values, () => {
						this.setState({confirmLoading : false});
					}));

				this.setState({confirmLoading : true});
			}
		});
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	render() {
		const {form} = this.props;
		const {loading, confirmLoading} = this.state;
		const {getFieldDecorator} = form;

		return (
			<Form onSubmit={this.handleSubmit}>
				<Spin spinning={loading}>
					<Form.Item labelAlign="left"
					           label={
						           <FormattedMessage
							           defaultMessage="Body"
							           id="admin.customize.body"/>
					           }>
						{getFieldDecorator("body", {
							initialValue : "",
							rules        : [{required : true}],
						})(<Editor/>)}
					</Form.Item>

					<Form.Item>
						<Button type="primary" icon="save"
						        htmlType="submit" shape="round"
						        loading={confirmLoading}>
							<span>
								<FormattedMessage
									defaultMessage="Submit"
									id="common.submit"/>
							</span>
						</Button>
					</Form.Item>
				</Spin>
			</Form>
		);
	}
}

export default pipe(
	formHelper(),
)(Footer);