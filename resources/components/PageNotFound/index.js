import React, {Component} from 'react';
import {Button, Result} from "antd";
import {FormattedMessage} from "react-intl"
import {Link} from "react-router-dom";

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
				        <Link to="/">
					        <Button type="primary">
						        <FormattedMessage
							        defaultMessage="Back Home"
							        id="common.back_home"/>
					        </Button>
				        </Link>
			        }/>
		);
	}
}

export default PageNotFound;