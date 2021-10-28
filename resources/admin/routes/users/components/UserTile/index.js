import React, {Component} from 'react';
import moment from "moment/moment";
import {Card, Checkbox, Col, Icon, Row, Tag} from "antd";
import UserAvatar from "admin/components/UserAvatar";
import {pipe, stringToHex} from "admin/support/utils/common";
import {FormattedMessage} from "react-intl";
import {includes, isEqual} from "lodash";
import Context from "../Context";
import UserRating from "admin/components/UserRating";
import millify from "millify";
import Flag from "admin/components/Flag";
import Auth from "admin/support/Auth";
import {connect} from "react-redux";

class Tile extends Component {
	changeRole = (item, roles) => {
		const {onChangeRole} = this.props;
		if (onChangeRole) onChangeRole(item, roles);
	};

	activate = (item) => {
		const {onActivate} = this.props;
		if (onActivate) onActivate(item);
	};

	deactivate = (item, date) => {
		const {onDeactivate} = this.props;
		if (onDeactivate) onDeactivate(item, date);
	};

	delete = (item) => {
		const {onDelete} = this.props;
		if (onDelete) onDelete(item);
	};

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		return !isEqual(nextProps, this.props)
			|| !isEqual(nextState, this.state)
	}

	onSelectData = (e) => {
		const {onSelectData} = this.props;
		if (onSelectData) onSelectData(e);
	};

	render() {
		const {data, selectedData, roles, superAdminRole} = this.props;

		return (
			<div className="p-2">
				<Row gutter={8} className="d-flex flex-wrap justify-content-center">
					{data.map((item) => {
						const registeredOn = moment.utc(item.created_at);
						const inactiveUntil = moment.utc(item.inactive_until);
						let status = "active";

						if (inactiveUntil.isValid() && inactiveUntil.local().isAfter(moment())) {
							status = "inactive";
						}
						return (
							<Col key={item.id} sm={12} md={12} lg={24} xl={12} xxl={8}>
								<Card bordered={false}
								      className="cp-card-widget"
								      actions={[
									      <a href={`/profile/${item.name}`}>
										      <Icon type="eye" className="cp-icon-btn d-flex"/>
									      </a>,
									      <Checkbox className="cp-icon-btn d-flex"
									                checked={includes(selectedData, item.id)}
									                value={item.id}
									                onChange={this.onSelectData}/>,
									      <Context item={item} status={status} roles={roles}
									               onDelete={this.delete}
									               onChangeRole={this.changeRole}
									               onDeactivate={this.deactivate}
									               onActivate={this.activate}>
										      <Icon type="ellipsis" className="cp-icon-btn d-flex"/>
									      </Context>,
								      ]}>
									<Card.Meta
										avatar={
											<UserAvatar size="large" user={item}/>
										}
										title={
											<span>
												<span>
													{status === "active" ?
														<i className="la la-check-circle cp-text-green mr-2"/> :
														<i className="la la-ban cp-text-red mr-2"/>
													}
													<span className="mr-2">
														<a href={`/profile/${item.name}`}> {item.name} </a>
													</span>
													{item.location && (
														<Flag code={item.location.iso_code}/>
													)}
												</span>
												<span className="d-none d-sm-inline">
													{item.all_roles.map((role, index) => role === superAdminRole ? (
														<i key={index} className="la la-certificate cp-fs-xl cp-text-primary"/>
													) : (
														<Tag key={index} className="m-0 mr-2" color={stringToHex(role)} children={role}/>
													))}
												</span>
											</span>
										}
										description={
											<span>
												<div className="mb-1">
													<span className="font-weight-bold">
														{item.email}
													</span>
												</div>
												{status === "inactive" ?
													<div className="mb-1">
														<span className="mr-2">
															<FormattedMessage
																defaultMessage="Inactive Until"
																id="admin.inactive_until"/>:
														</span>
														<span>
															{inactiveUntil.local().format('MMMM Do YYYY')}
														</span>
													</div> :
													<div className="mb-1">
														<span className="mr-2">
															<FormattedMessage
																defaultMessage="Registered On"
																id="admin.registered_on"/>:
														</span>
														<span>
															{registeredOn.local().format('MMMM Do YYYY')}
														</span>
													</div>
												}
												<div>
													<UserRating value={item.average_marketplace_rating}/>
													<span className="ml-2">
														({millify(item.total_marketplace_rating)})
													</span>
												</div>
											</span>
										}/>
								</Card>
							</Col>
						)
					})}
				</Row>
			</div>
		);
	}
}

const mapStateToProps = ({
	auth
}) => ({
	superAdminRole : auth.superAdminRole,
	auth           : new Auth(auth)
});

export default pipe(
	connect(
		mapStateToProps,
	),
)(Tile);