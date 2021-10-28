import React, {Component} from 'react';
import Widget from "components/Widget";
import {FormattedMessage} from "react-intl";
import millify from "millify";
import {Col, Row} from "antd";
import {formatUTCDate, utcDateCalendarTime} from "support/utils/common";

class About extends Component {
	render() {
		const {user} = this.props;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="About"
						id="common.about"/>
				}>
				<Row gutter={8} className="d-flex flex-wrap">
					<Col xl={8} lg={12} md={12} sm={12} xs={24}>
						<div className="cp-media cp-flex-nowrap mb-3">
							<div className="mr-3">
								<i className={`la la-calendar cp-fs-3x cp-text-primary`}/>
							</div>
							<div className="cp-media-body">
								<h6 className="mb-1 cp-text-grey">
									<FormattedMessage
										defaultMessage="Registered on"
										id="profile.registered_on"/>
								</h6>
								<span className="cp-fs-xl">
									{formatUTCDate(user.created_at, 'MMMM Do YYYY')}
								</span>
							</div>
						</div>
					</Col>

					<Col xl={8} lg={12} md={12} sm={12} xs={24}>
						<div className="cp-media cp-flex-nowrap mb-3">
							<div className="mr-3">
								<i className={`la la-exchange-alt cp-fs-3x cp-text-primary`}/>
							</div>
							<div className="cp-media-body">
								<h6 className="mb-1 cp-text-grey">
									<FormattedMessage
										defaultMessage="Successful Trades"
										id="profile.successful_trades"/>
								</h6>
								<span className="cp-fs-xl">
									{millify(user.marketplace_stats.total_successful_trades)}
								</span>
							</div>
						</div>
					</Col>

					<Col xl={8} lg={12} md={12} sm={12} xs={24}>
						<div className="cp-media cp-flex-nowrap mb-3">
							<div className="mr-3">
								<i className={`la la-clock cp-fs-3x cp-text-primary`}/>
							</div>
							<div className="cp-media-body">
								<h6 className="mb-1 cp-text-grey">
									<FormattedMessage
										defaultMessage="Last Seen"
										id="profile.last_seen"/>
								</h6>
								<span className="cp-fs-xl">
									{!user.last_seen_at ? (
											<FormattedMessage
												defaultMessage="Not Available"
												id="common.not_available"/>
										) :
										utcDateCalendarTime(user.last_seen_at)
									}
								</span>
							</div>
						</div>
					</Col>

					<Col xl={8} lg={12} md={12} sm={12} xs={24}>
						<div className="cp-media cp-flex-nowrap mb-3">
							<div className="mr-3">
								<i className={`la la-star cp-fs-3x cp-text-primary`}/>
							</div>
							<div className="cp-media-body">
								<h6 className="mb-1 cp-text-grey">
									<FormattedMessage
										defaultMessage="Trusted By"
										id="profile.trusted_by"/>
								</h6>
								<span className="cp-fs-xl">
									{millify(user.trusted_by_count)}
								</span>
							</div>
						</div>
					</Col>

					<Col xl={8} lg={12} md={12} sm={12} xs={24}>
						<div className="cp-media cp-flex-nowrap mb-3">
							<div className="mr-3">
								<i className={`la la-ban cp-fs-3x cp-text-primary`}/>
							</div>
							<div className="cp-media-body">
								<h6 className="mb-1 cp-text-grey">
									<FormattedMessage
										defaultMessage="Blocked By"
										id="profile.blocked_by"/>
								</h6>
								<span className="cp-fs-xl">
									{millify(user.blocked_by_count)}
								</span>
							</div>
						</div>
					</Col>

                    <Col xl={8} lg={12} md={12} sm={12} xs={24}>
						<div className="cp-media cp-flex-nowrap mb-3">
							<div className="mr-3">
								<i className="la la-tachometer-alt cp-fs-3x cp-text-primary"/>
							</div>
							<div className="cp-media-body">
								<h6 className="mb-1 cp-text-grey">
									<FormattedMessage
										defaultMessage="Trade Speed"
										id="profile.trade_speed"/>
								</h6>
								<span className="cp-fs-xl">
									{user.marketplace_stats.selling_speed} minutes
								</span>
							</div>
						</div>
					</Col>
				</Row>
			</Widget>
		);
	}
}

export default About;
