import App from "installer/App";
import React, {Component} from 'react';
import {pipe} from "installer/support/utils/common"
import {IntlProvider} from "react-intl";
import {connect} from "react-redux";
// import {fetchLocaleData} from "installer/redux/actions/Settings";
import 'simplebar';

class Bootstrap extends Component {
	render() {
		const {localeData} = this.props;

		return (
			<IntlProvider messages={localeData.messages}
			              locale={localeData.locale}>
				<App/>
			</IntlProvider>
		);
	}
}

const mapStateToProps = ({
	settings : {
		localeData,
	}
}) => ({
	localeData,
});


export default pipe(
	connect(
		mapStateToProps,
	)
)(Bootstrap);