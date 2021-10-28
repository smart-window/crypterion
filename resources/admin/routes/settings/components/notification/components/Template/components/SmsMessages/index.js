import React, {Component} from 'react';
import EditMessageForm from "./components/EditMessageForm";

class SmsMessages extends Component {
	update = (item) => {
		const {onUpdate} = this.props;
		if (typeof onUpdate === "function") {
			return onUpdate(item)
		}
	};

	render() {
		const {data, template} = this.props;
		return (
			<div>
				{data.map((message) => (
					<EditMessageForm
						key={message.id}
						onSuccess={this.update}
						template={template}
						message={message}/>
				))}
			</div>
		);
	}
}

export default SmsMessages;