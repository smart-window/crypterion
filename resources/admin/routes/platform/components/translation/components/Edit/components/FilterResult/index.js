import React, {Component} from 'react';
import {Button, Col, Form, Input, Row} from "antd";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";
import {defineMessages, FormattedMessage} from "react-intl";
import {isEmpty, values} from "lodash";

const messages = defineMessages({
	filter : {
		defaultMessage : "Filter by default message...",
		id             : "admin.translation.input_edit_filter_placeholder"
	},
});

class FilterResult extends Component {
	applyFilter = () => {
		const {onApply, form} = this.props;

		form.validateFields((errors, values) => {
			if (typeof onApply === "function" && isEmpty(errors)) {
				return onApply(values);
			}
		});
	};

	clearFilter = () => {
		const {onClear, form} = this.props;

		form.resetFields();

		if (typeof onClear === "function") {
			return onClear();
		}
	};

	render() {
		const {intl, form} = this.props;
		const {getFieldDecorator, getFieldsValue} = form;
		const hasFilter = values(getFieldsValue()).some(x => x);

		return (
			<Form>
				<Row gutter={8}>
					<Col sm={16}>
						<Form.Item>
							{getFieldDecorator('value')(
								<Input placeholder={intl.formatMessage(messages.filter)}/>
							)}
						</Form.Item>
					</Col>

					<Col sm={8}>
						<Form.Item>
							<Button type="default" icon="search"
							        shape="round"
							        onClick={this.applyFilter}>
								<span>
									<FormattedMessage
										defaultMessage="Apply"
										id="admin.translation.apply"/>
								</span>
							</Button>
							{hasFilter && (
								<Button type="default" icon="close"
								        shape="circle"
								        onClick={this.clearFilter}/>
							)}
						</Form.Item>
					</Col>
				</Row>
			</Form>
		);
	}
}

export default pipe(
	formHelper(),
)(FilterResult);