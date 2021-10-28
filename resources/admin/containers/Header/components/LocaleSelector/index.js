import React, {Component} from "react";
import {connect} from "react-redux"
import {Dropdown, Menu} from "antd";
import {pipe} from "admin/support/utils/common";
import {setLocale} from "admin/redux/actions/Settings";

class LocaleSelector extends Component {
	handleClick(locale) {
		const {localeData} = this.props;
		if (locale !== localeData.locale) {
			this.props.setLocale(locale);
		}
	};

	getMenu() {
		const {supportedLocales} = this.props;
		let menuItems = [];

		for (let i in supportedLocales) {
			if (supportedLocales.hasOwnProperty(i)) {
				menuItems.push(supportedLocales[i])
			}
		}

		return (
			<Menu>
				{menuItems.map((data) =>
					<Menu.Item key={data.locale}
					           onClick={this.handleClick.bind(this, data.locale)}>
						<i className={`flag-icon mr-2 flag-icon-${data.region}`}/>
						<span className="cp-language-text">
							{data.native}
						</span>
					</Menu.Item>
				)}
			</Menu>
		);
	};

	render() {
		const {localeData, supportedLocales} = this.props;
		const locale = supportedLocales[localeData.locale];
		return (
			<Dropdown placement="bottomRight"
			          overlay={this.getMenu()}
			          trigger={['click']}>
				<span className="cp-pointer flex-row align-items-center">
					<i className={`flag-icon flag-icon-${locale.region}`}/>
				</span>
			</Dropdown>
		)
	}
}


const mapStateToProps = ({
	settings : {
		localeData,
		supportedLocales
	}
}) => ({
	localeData,
	supportedLocales
});

export default pipe(
	connect(
		mapStateToProps,
		{setLocale}
	)
)(LocaleSelector);