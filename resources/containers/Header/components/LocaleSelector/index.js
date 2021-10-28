import React, {Component} from "react";
import {connect} from "react-redux"
import {Dropdown, Menu} from "antd";
import {setLocale} from "redux/actions/Settings";
import {pipe} from "support/utils/common";

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
		const {withName, localeData, supportedLocales} = this.props;
		const locale = supportedLocales[localeData.locale];
		return (
			<Dropdown overlay={this.getMenu()}
			          trigger={['click']}
			          placement="bottomRight">
				<span className="cp-pointer flex-row align-items-center">
					<i className={`flag-icon flag-icon-${locale.region}`}/>
					{withName && (
						<span className="pl-2 cp-language-name">
							{locale.native}
						</span>
					)}
				</span>
			</Dropdown>
		)
	}
}

LocaleSelector.defaultProps = {
	withName : false
};

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