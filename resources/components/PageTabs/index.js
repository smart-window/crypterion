import React, {Component} from 'react';
import {Tabs} from "antd";
import {TAB_BREAKPOINT} from "constants/ThemeSettings";
import {connect} from "react-redux";
import {pipe} from "support/utils/common";
import {withRouter} from "react-router-dom";
import {assign} from "lodash";

class PageTabs extends Component {
	onTabChange = (value) => {
		if (typeof sessionStorage !== "undefined") {
			sessionStorage.setItem(this.getStorageKey(), value)
		}
	};

	getStorageKey() {
		return `page.tab(${this.props.location.pathname})`;
	};

	getTabPosition() {
		const {width} = this.props.windowSize;

		if (width && width < TAB_BREAKPOINT) {
			return 'top';
		} else {
			return 'left';
		}
	}

	getDefaultActiveKey() {
		let activeKey = undefined;
		if (typeof sessionStorage !== "undefined") {
			activeKey = sessionStorage.getItem(this.getStorageKey()) || undefined;
		}
		return activeKey;
	}

	render() {
		const defaultActiveKey = this.getDefaultActiveKey();
		let attributes = {};

		if (defaultActiveKey) {
			attributes = assign(attributes, {defaultActiveKey});
		}

		return (
			<Tabs onChange={this.onTabChange}
			      tabPosition={this.getTabPosition()}
			      {...attributes} {...this.props}/>
		);
	}
}

const mapStateToProps = ({
	settings : {
		windowSize
	}
}) => ({
	windowSize
});


export default pipe(
	connect(mapStateToProps),
	withRouter
)(PageTabs);