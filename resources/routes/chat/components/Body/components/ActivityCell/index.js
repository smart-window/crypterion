import React, {Component} from 'react';
import {Divider, List} from "antd";
import {utcDateCalendarTime} from "support/utils/common";
import {FormattedMessage} from "react-intl";
import {isEmpty} from "lodash";

class ActivityCell extends Component {
	getTimestamp() {
		const {message} = this.props;
		return (
			<span className="font-weight-semi-bold">
				{utcDateCalendarTime(message.created_at)}
			</span>
		);
	}

	getUserName() {
		const {message} = this.props;
		if (isEmpty(message.user)) {
			return (
				<FormattedMessage
					defaultMessage="Unknown User"
					id="common.unknown_user"/>
			);
		} else {
			return (
				<span className="font-weight-medium">
					{message.user.name}:
				</span>
			)
		}
	}

	render() {
		const {message} = this.props;
		const activity = message.activity;

		if (isEmpty(activity) || !activity.body) {
			return <List.Item/>;
		}

		return (
			<Divider className="font-weight-normal"
			         dashed={true}>
				<small>
					<FormattedMessage
						id="chat.activity_body"
						defaultMessage="{user} {body} {time}"
						values={{
							time : this.getTimestamp(),
							body : activity.body,
							user : this.getUserName(),
						}}/>
				</small>
			</Divider>
		);
	}
}

export default ActivityCell;