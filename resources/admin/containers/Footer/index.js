import React, {Component} from "react";
import {Layout} from "antd";
import moment from "moment/moment"

class Footer extends Component
{
	render() {
		return (
			<Layout.Footer>
				<div className="cp-layout-footer-content">
					Copyright <a href="//neoscrypts.com">NeoScrypts</a> &copy; {moment().year()}
				</div>
			</Layout.Footer>
		)
	}
}

export default Footer;