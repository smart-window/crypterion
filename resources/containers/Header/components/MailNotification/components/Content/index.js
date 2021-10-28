import React, {Component} from 'react';
import NotificationItem from "./components/NotificationItem";
import {pipe} from "support/utils/common";
import {connect} from "react-redux";
import {FormattedMessage, injectIntl} from "react-intl";
import {withRouter} from "react-router-dom";
import {List} from "antd";
import Auth from "support/Auth";
import SimpleBar from "simplebar";

class Content extends Component {
	clearAll = () => {
		const {onClearAll} = this.props;
		if (typeof onClearAll === "function") {
			return onClearAll();
		}
	};

	setScrollWrapper = (ref) => {
		if (ref !== this.scrollWrapper && ref !== null) {
			const simpleBar = new SimpleBar(ref);
			this.scrollParent = simpleBar.getScrollElement();
			this.scrollWrapper = ref
		}
	};

	render() {
		const {data} = this.props;
		return (
			<React.Fragment>
				<div className="cp-popover-header">
					<h3 className="mb-0">
						<FormattedMessage
							defaultMessage="Unread Messages"
							id="common.unread_messages"/>
					</h3>

					<i className="cp-icon-btn cp-fs-xl la la-check-circle"
					   onClick={this.clearAll}/>
				</div>

				<div ref={this.setScrollWrapper}
				     className="cp-popover-scroll"
				     data-simplebar={true}>
					<ul className="cp-sub-popover">
						<List dataSource={data}
						      rowKey={(record) => record.id}
						      renderItem={item => {
							      return <NotificationItem notification={item}/>;
						      }}/>
					</ul>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	auth : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps
	),
	injectIntl,
	withRouter
)(Content);

