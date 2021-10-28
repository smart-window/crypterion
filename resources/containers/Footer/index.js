import React, {Component} from "react";
import {Layout} from "antd";
import moment from "moment";
import DOMPurify from "dompurify"
import {get} from "lodash";
import context from "context";

const {page, name} = context;

class Footer extends Component {
	createFooter = () => {
		const footer = get(page, 'footer');

		if (typeof footer === "string") {
			return {__html : DOMPurify.sanitize(footer)};
		} else {
			return null;
		}
	};

	render() {
		const footer = this.createFooter();

		return (
			<Layout.Footer>
				{footer ? (
					<div dangerouslySetInnerHTML={footer}/>
				) : (
					<div className="cp-layout-footer-content">
						{name} &trade; {moment().year()}
					</div>
				)}
			</Layout.Footer>
		)
	}
}

export default Footer;
