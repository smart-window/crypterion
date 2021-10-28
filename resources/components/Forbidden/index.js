import React, {Component} from 'react';
import {Button, Result} from "antd";
import {FormattedMessage} from "react-intl"
import {Link} from "react-router-dom";

class Forbidden extends Component {
	render() {
		return (
			<Result title="403"
			        status="403"
			        subTitle={
				        <FormattedMessage
					        defaultMessage="Sorry, you are not authorized to access this page."
					        id="common.forbidden_access"/>
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

export default Forbidden;