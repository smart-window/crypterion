import React, {Component} from 'react';
import {includes, isEqual} from "lodash";
import {Card, Checkbox, List} from "antd";
import UserAvatar from "components/UserAvatar";
import {utcDateCalendarTime} from "support/utils/common";
import {FormattedMessage} from "react-intl";
import millify from "millify";
import UserRating from "components/UserRating";
import Context from "../Context";
import {Link} from "react-router-dom";
import Flag from "components/Flag";

const Item = List.Item;
const ItemMeta = Item.Meta;

class UserList extends Component {
	onSelectData = (e) => {
		const {onSelectData} = this.props;
		if (onSelectData) onSelectData(e);
	};

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		return !isEqual(nextProps, this.props)
			|| !isEqual(nextState, this.state)
	}

	trust = (item) => {
		const {onTrust} = this.props;
		if (onTrust) onTrust(item);
	};

	delete = (item) => {
		const {onDelete} = this.props;
		if (onDelete) onDelete(item);
	};

	block = (item) => {
		const {onBlock} = this.props;
		if (onBlock) onBlock(item);
	};

	resetStatus = (item) => {
		const {onResetStatus} = this.props;
		if (onResetStatus) onResetStatus(item);
	};

	render() {
		const {data, selectedData} = this.props;

		return (
			<div className="p-2">
				<List dataSource={data}
				      rowKey={(record) => record.id}
				      renderItem={item => {
					      const lastSeen = item.last_seen_at;
					      return (
						      <Card className="cp-card-list">
							      <Item className="px-3"
							            actions={[
							            	<span className="d-none d-sm-flex">
									            <Checkbox className="cp-icon-btn"
									                      checked={includes(selectedData, item.id)}
									                      value={item.id}
									                      onChange={this.onSelectData}/>
								            </span>,
								            <Context status={item.pivot.status}
								                     onDelete={this.delete}
								                     onTrust={this.trust} item={item}
								                     onResetStatus={this.resetStatus}
								                     onBlock={this.block}>
									            <i className="cp-icon-btn d-flex cp-fs-xxl la la-ellipsis-h"/>
								            </Context>
							            ]}>
								      <ItemMeta
									      avatar={
										      <UserAvatar size="large" user={item}/>
									      }
									      title={
										      <React.Fragment>
											      <span>
												      <span className="mr-2">
													      <Link to={`/profile/${item.name}`}> {item.name} </Link>
												      </span>
												      {item.pivot.status === "block" && (
													      <i className="la la-ban cp-text-red mr-2"/>)}
												      {item.pivot.status === "trust" && (
													      <i className="la la-star cp-text-green mr-2"/>)}
												      {item.location && (
													      <Flag code={item.location.iso_code}/>
												      )}
												      <span className="border-left pl-3 d-none d-sm-inline">
													      <UserRating value={item.average_marketplace_rating}/>
													      <span className="ml-2">
														      ({millify(item.total_marketplace_rating)})
													      </span>
												      </span>
											      </span>
										      </React.Fragment>
									      }
									      description={
										      <React.Fragment>
											      <span className="d-inline-block mr-2">
												      <span className="font-weight-bold">
													      <FormattedMessage
														      defaultMessage="Successful Trades"
														      id="profile.successful_trades"/>:
												      </span>
												      <span className="ml-2">
													      {millify(item.marketplace_stats.total_successful_trades)}
												      </span>
												      <span className="d-inline">,</span>
											      </span>
											      <span className="d-inline-block mr-2">
												      <span className="font-weight-bold">
													      <FormattedMessage
														      defaultMessage="Offers"
														      id="profile.offers"/>:
												      </span>
												      <span className="ml-2">
													      {millify(item.marketplace_stats.total_offers)}
												      </span>
												      <span className="d-none d-sm-inline">,</span>
											      </span>
											      {lastSeen && (
												      <span className="d-none d-sm-inline-block">
													      <span className="mr-2 font-weight-bold">
														      <FormattedMessage
															      defaultMessage="Last Seen"
															      id="profile.last_seen"/>:
													      </span>
													      <span>
														      {utcDateCalendarTime(lastSeen)}
													      </span>
												      </span>
											      )}
										      </React.Fragment>
									      }/>
							      </Item>
						      </Card>
					      )
				      }}/>
			</div>
		);
	}
}

export default UserList;