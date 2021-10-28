import App from "admin/App";
import React, {Component} from 'react';
import {pipe} from "admin/support/utils/common"
import {IntlProvider} from "react-intl";
import {connect} from "react-redux";
import {fetchLocaleData} from "admin/redux/actions/Settings";
import 'simplebar';

class Bootstrap extends Component {
	componentDidMount() {
		this.props.fetchLocaleData();
	}

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
		{
			fetchLocaleData,
		}
	)
)(Bootstrap);