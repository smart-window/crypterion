import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import Widget from "components/Widget";
import {List} from "antd";

class Verification extends Component {
	render() {
		const {user} = this.props;

		const data = [
			{
				name   : (
					<FormattedMessage
						defaultMessage="Phone Verification"
						id="common.phone_verification"/>
				),
				status : !!user.phone_verified_at
			},
			{
				name   : (
					<FormattedMessage
						defaultMessage="Email Verification"
						id="common.email_verification"/>
				),
				status : !!user.email_verified_at
			}
		];

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Verification"
						id="common.verification"/>
				}>
				<List dataSource={data}
				      renderItem={item => (
					      <List.Item>
						      <List.Item.Meta title={item.name}/>
						      {item.status ? (
							      <i className="la la-check-circle cp-fs-xl cp-text-green"/>
						      ) : (
							      <i className="la la-times cp-fs-xl cp-text-red"/>
						      )}
					      </List.Item>
				      )}/>
			</Widget>
		);
	}
}

export default Verification;