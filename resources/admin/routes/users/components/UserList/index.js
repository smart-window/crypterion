import React, {Component} from 'react';
import moment from "moment/moment";
import {Card, Checkbox, List, Tag} from "antd";
import UserAvatar from "admin/components/UserAvatar";
import {pipe, stringToHex} from "admin/support/utils/common";
import {includes, isEqual} from "lodash";
import {FormattedMessage} from "react-intl";
import Context from "../Context";
import UserRating from "admin/components/UserRating";
import millify from "millify";
import Flag from "admin/components/Flag";
import Auth from "admin/support/Auth";
import {connect} from "react-redux";

const Item = List.Item;
const ItemMeta = Item.Meta;

class UserList extends Component {
	onLoadMore = (page) => {
		const {onLoadMore} = this.props;
		if (onLoadMore) onLoadMore(page);
	};

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
				<List dataSource={data}
				      rowKey={(record) => record.id}
				      renderItem={item => {
					      const registeredOn = moment.utc(item.created_at);
					      const inactiveUntil = moment.utc(item.inactive_until);
					      let status = "active";

					      if (inactiveUntil.isValid() && inactiveUntil.local().isAfter(moment())) {
						      status = "inactive";
					      }
					      return (
						      <Card className="cp-card-list">
							      <Item className="px-3"
							            actions={[
								            <Checkbox className="cp-icon-btn"
								                      checked={includes(selectedData, item.id)}
								                      value={item.id}
								                      onChange={this.onSelectData}/>,
								            <Context item={item} status={status} roles={roles}
								                     onDelete={this.delete}
								                     onChangeRole={this.changeRole}
								                     onDeactivate={this.deactivate}
								                     onActivate={this.activate}>
									            <i className="cp-icon-btn d-none d-sm-flex cp-fs-xxl la la-ellipsis-h"/>
								            </Context>
							            ]}>
								      <ItemMeta
									      avatar={
										      <UserAvatar size="large" user={item}/>
									      }
									      title={
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

											      <span className="d-none d-sm-inline">
												      {item.all_roles.map((role, index) => role === superAdminRole ? (
													      <i key={index} className="la la-certificate cp-fs-lg cp-text-primary"/>
												      ) : (
													      <Tag key={index} className="m-0 mr-2" color={stringToHex(role)} children={role}/>
												      ))}
											      </span>

											      <span className="ml-2 border-left pl-2 d-none d-sm-inline">
												      <UserRating value={item.average_marketplace_rating}/>

												      <span className="ml-2">
													      ({millify(item.total_marketplace_rating)})
												      </span>
											      </span>
										      </span>
									      }
									      description={
										      <span>
											      <span className="d-inline-block">
												      {status === "inactive" ?
													      <React.Fragment>
														      <span className="mr-2 font-weight-bold">
															      <FormattedMessage
																      defaultMessage="Inactive Until"
																      id="admin.inactive_until"/>:
														      </span>
														      <span>
															      {inactiveUntil.local().format('MMMM Do YYYY')}
														      </span>
													      </React.Fragment> :
													      <React.Fragment>
														      <span className="mr-2 font-weight-bold">
															      <FormattedMessage
																      defaultMessage="Registered On"
																      id="admin.registered_on"/>:
														      </span>
														      <span>
															      {registeredOn.local().format('MMMM Do YYYY')}
														      </span>
													      </React.Fragment>
												      }
												      <span className="d-none d-sm-inline mr-2">,</span>
											      </span>
											      <span className="d-none d-sm-inline">
												      <span className="font-weight-bold">
													      <FormattedMessage
														      defaultMessage="Email"
														      id="common.email"/>:
												      </span>
												      <span className="ml-2">{item.email}</span>
											      </span>
										      </span>
									      }/>
							      </Item>
						      </Card>
					      )
				      }}/>
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
)(UserList);