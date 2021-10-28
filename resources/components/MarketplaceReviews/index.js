import React, {Component} from 'react';
import {FormattedMessage} from "react-intl";
import {Comment, List, Spin} from "antd";
import Widget from "components/Widget";
import ApiService from "support/Services/Api";
import Pagination from "support/Helpers/Pagination";
import {formatUTCDate, truncate} from "support/utils/common";
import {Link} from "react-router-dom";
import Flag from "../Flag";
import {isEmpty} from "lodash";
import UserAvatar from "../UserAvatar";
import UserRating from "../UserRating";

class MarketplaceReviews extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			data    : [],
			loading : false,
			hasMore : false,
			params  : {
				pageSize : 10
			}
		};

		const endpoint = this.api.route('user.marketplace-ratings', {
			name : props.user.name
		}).url();

		this.pagination = new Pagination(this.api, endpoint);
	}

	componentDidMount() {
		this.fetchUserRatings();
	}

	fetchUserRatings() {
		this.setState({loading : true});

		const {params} = this.state;
		const nextParams = {...params, current : 1};

		this.pagination.fetchData(
			nextParams, {}, (page) => {
				this.setState({
					data    : page.data,
					loading : false,
					hasMore : Boolean(page.links.next),
					params  : {
						...nextParams,
						total : page.meta.total
					},
				})
			}, () => {
				this.setState({loading : false})
			}
		)
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const user = this.props.user;
		const prevUser = prevProps.user;
		if (user.id !== prevUser.id) {
			this.fetchUserRatings();
		}
	}

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {data, loading} = this.state;
		return (
			<Widget styleName="cp-card-reviews"
			        title={
				        <FormattedMessage
					        defaultMessage="Latest Marketplace Reviews"
					        id="common.latest_marketplace_reviews"/>
			        }>
				<Spin spinning={loading}>
					<div className="cp-profile-reviews-scroll"
					     data-simplebar={true}>
						<List itemLayout="vertical"
						      dataSource={data}
						      renderItem={item => {
							      const rater = item.rater;
							      if (isEmpty(rater)) return <List.Item/>;
							      return (
								      <List.Item>
									      <Comment
										      content={truncate(item.comment, 200)}
										      avatar={
											      <UserAvatar user={rater}/>
										      }
										      datetime={
											      <span>
												      {formatUTCDate(item.created_at, 'MMMM Do YYYY')}
											      </span>
										      }
										      actions={[
											      <UserRating value={item.rating}/>
										      ]}
										      author={
											      <div className="d-flex">
												      <span className="mr-2">
													      <Link to={`/profile/${rater.name}`}>
														      {rater.name}
													      </Link>
												      </span>
												      {rater.location && (
													      <Flag code={rater.location.iso_code}/>
												      )}
											      </div>
										      }/>
								      </List.Item>
							      )
						      }}/>
					</div>
				</Spin>
			</Widget>
		);
	}
}

export default MarketplaceReviews;