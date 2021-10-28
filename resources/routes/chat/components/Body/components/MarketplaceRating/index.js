import React, {Component} from 'react';
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage} from "react-intl";
import {Button, Comment, Form, Input, Rate} from "antd";
import ApiService from "support/Services/Api";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "support/utils/promise";
import formHelper from "support/Helpers/Form";

const TextArea = Input.TextArea;

const messages = defineMessages({
	successful : {
		defaultMessage : "You review has been submitted.",
		id             : "admin.review_submitted_successful"
	},
	review     : {
		defaultMessage : "Write a review...",
		id             : "admin.textarea_review_placeholder"
	},
});

class MarketplaceRating extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			submitted : false,
			loading   : false,
		}
	}

	canSubmitReview() {
		const {trade, auth} = this.props;
		const {submitted} = this.state;
		if (trade.status !== 'successful') return false;

		if (trade.buyer_id === auth.user.id) {
			return trade.seller_rateable && !submitted;
		}

		if (trade.seller_id === auth.user.id) {
			return trade.buyer_rateable && !submitted;
		}
		return false;
	}

	handleSubmit = (e) => {
		e.preventDefault();
		const {form, intl, trade} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('chats.marketplace.submit-review', {
			trade : trade.id
		});
		form.validateFields((errors, values) => {
			if (isEmpty(errors)) {
				axios.post(endpoint.url(), values)
					.then(response => handleFormSuccess(response, form, () => {
						this.setState({loading : false, submitted : true});
					}, intl.formatMessage(messages.successful)))

					.catch(error => handleFormError(error, form, values, () => {
						this.setState({loading : false});
					}));

				this.setState({loading : true});
			}
		});
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		if (!this.canSubmitReview()) return null;

		const {intl, form} = this.props;
		const {getFieldDecorator} = form;
		const {loading} = this.state;

		return (
			<div className="px-3">
				<Comment
					content={
						<Form onSubmit={this.handleSubmit}>
							<Form.Item>
								{getFieldDecorator('comment', {
									rules : [
										{type : 'string', required : true, min : 3, max : 200}
									],
								})(
									<TextArea style={{resize : 'none'}}
									          placeholder={intl.formatMessage(messages.review)}
									          rows={3}/>
								)}
							</Form.Item>

							<Form.Item className="d-flex align-items-center">
								<span className="mr-2">
									<FormattedMessage
										defaultMessage="Rate"
										id="common.rate"/>:
								</span>
								{getFieldDecorator('rating', {
									rules : [
										{type : 'number', required : true, min : 1, max : 5}
									],
								})(<Rate/>)}
							</Form.Item>

							<Form.Item>
								<Button htmlType="submit" loading={loading}
								        className="mb-0" shape="round" type="primary">
									<span>
										<FormattedMessage
											defaultMessage="Submit Review"
											id="marketplace.submit_review"/>
									</span>
								</Button>
							</Form.Item>
						</Form>
					}/>
			</div>
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
)(MarketplaceRating);