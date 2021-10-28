import React, {Component} from 'react';
import intlTelInput from "intl-tel-input"
import "intl-tel-input/build/js/utils"
import ApiService from "support/Services/Api";
import {get} from "lodash";
import {handleError, handleSuccess} from "support/utils/promise";

class PhoneInput extends Component {
	constructor(props) {
		super(props);

		this.phoneInputRef = React.createRef();
		this.api = new ApiService();
	}

	componentDidMount() {
		this.initIntlTelInput();
	}

	handleChange = (e) => {
		const {onChange} = this.props;
		if (typeof onChange === "function") {
			return onChange(e.target.value);
		}
	};

	initIntlTelInput() {
		const {itl} = this.props;
		const {current} = this.phoneInputRef;
		const {axios, route} = this.api;

		this.intlTelInput = intlTelInput(current, {
			initialCountry : 'auto',
			nationalMode   : false,
			geoIpLookup    : function (callback) {
				const endpoint = route('ip.info');
				axios.post(endpoint.url())
					.then(response => handleSuccess(response, (data) => {
						callback(get(data, 'iso_code'));
					}))
					.catch(error => handleError(error));
			}
		});

		if (typeof itl === "function") {
			itl(this.intlTelInput);
		}
	}

	componentWillUnmount() {
		this.intlTelInput.destroy();
		this.api.cancel();
	}

	render() {
		const {itl, value, ...otherProps} = this.props;

		return (
			<input ref={this.phoneInputRef}
			       className="ant-input"
			       {...otherProps}
			       value={value || ""}
			       onChange={this.handleChange}
			       style={{width : '100%'}}/>
		);
	}
}

export default PhoneInput;