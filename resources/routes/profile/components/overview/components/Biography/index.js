import React, {Component} from 'react';
import Widget from "components/Widget";
import {FormattedMessage} from "react-intl";


class Biography extends Component {
	render() {
		const {user} = this.props;

		return (
			<Widget title={
				        <FormattedMessage
					        defaultMessage="Biography"
					        id="common.biography"/>
			        }>
				<p style={{minHeight : 100}}>
					{user.profile && user.profile.bio ? user.profile.bio : (
						<FormattedMessage
							defaultMessage="Hey there! I trade here on this platform also."
							id="profile.default_bio"/>
					)}
				</p>
			</Widget>
		);
	}
}

export default Biography;
