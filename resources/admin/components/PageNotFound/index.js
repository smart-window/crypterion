import React, {Component} from 'react';
import {Button, Result} from "antd";
import {FormattedMessage} from "react-intl"

class PageNotFound extends Component {
	render() {
		return (
			<Result title="404"
			        status="404"
			        subTitle={
				        <FormattedMessage
					        defaultMessage="Sorry, the page you visited does not exist."
					        id="common.page_not_found"/>
			        }
			        extra={
				        <a href="/">
					        <Button type="primary">
						        <FormattedMessage
							        defaultMessage="Back Home"
							        id="common.back_home"/>
					        </Button>
				        </a>
			        }/>
		);
	}
}

export default PageNotFound;