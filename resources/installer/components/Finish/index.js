import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Button} from "antd";

class Finish extends Component {
	render() {
		const {visible} = this.props;
		return (
			<div className={`${visible ? 'd-block' : 'd-none'}`}>
				<div className="text-center mb-4">
					<h1>
						<span className="mr-2">
							<i className="la la-trophy"/>
						</span>
						<span>
							<FormattedMessage
								defaultMessage="Installation Successful"
								id="installer.installation_successful"/>
						</span>
					</h1>
				</div>

				<div className="text-center">
					<Button type="primary"
					        href="/admin" icon="rocket"
					        size="large" shape="round">
						<span>
							<FormattedMessage
								defaultMessage="Start"
								id="installer.start"/>
						</span>
					</Button>
				</div>
			</div>
		);
	}
}

export default Finish;