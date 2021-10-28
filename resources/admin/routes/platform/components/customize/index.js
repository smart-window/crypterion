import React, {Component} from 'react';
import {Tabs} from "antd";
import PageTabs from "admin/components/PageTabs";
import {FormattedMessage} from "react-intl";
import Widgets from "./components/Widgets";
import Template from "./components/Template";
import Page from "./components/Page";
import Brand from "./components/Brand";

const {TabPane} = Tabs;

class Customize extends Component {
	render() {
		return (
			<PageTabs>
				<TabPane key="template"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-magic cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Template"
								         id="common.template"/>
						         </span>
					         </span>
				         }>
					<Template/>
				</TabPane>

				<TabPane key="brand"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-copyright cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Brand"
								         id="common.brand"/>
						         </span>
					         </span>
				         }>
					<Brand/>
				</TabPane>

				<TabPane key="page"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-globe cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Page"
								         id="common.page"/>
						         </span>
					         </span>
				         }>
					<Page/>
				</TabPane>

				<TabPane key="widgets"
				         tab={
					         <span className="d-flex align-items-center">
						         <i className="la la-puzzle-piece cp-fs-xl mr-2"/>
						         <span>
							         <FormattedMessage
								         defaultMessage="Widgets"
								         id="common.widgets"/>
						         </span>
					         </span>
				         }>
					<Widgets/>
				</TabPane>
			</PageTabs>
		);
	}
}

export default Customize;