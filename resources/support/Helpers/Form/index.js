import {Form} from 'antd';
import {injectIntl} from "react-intl";
import React, {Component} from "react";
import {validateMessages} from "./validationMessage";

const formHelper = (options) => (WrappedComponent) => {
	class FormHelper extends Component {
		constructor(props) {
			super(props);

			const {intl} = this.props;

			this.subComponent = Form.create({
				...options,
				validateMessages : validateMessages(intl)
			})(WrappedComponent)
		}

		render() {
			let SubComponent = this.subComponent;

			return (
				<SubComponent
					ref={this.props.forwardedRef}
					{...this.props}/>
			);
		}
	}

	const FormComponent = React.forwardRef((props, ref) => {
		return <FormHelper {...props} forwardedRef={ref}/>;
	});

	return injectIntl(FormComponent, {
		forwardRef: true
	});
};


export default formHelper;