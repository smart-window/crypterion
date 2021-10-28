import React, {Component} from 'react';
import NotificationItem from "./components/NotificationItem";
import ApiService from "support/Services/Api";
import Pagination from "support/Helpers/Pagination";
import {List, Spin} from "antd";
import {FormattedMessage} from "react-intl";
import InfiniteScroll from "react-infinite-scroller";
import SimpleBar from "simplebar";
import {handleError, handleSuccess} from "support/utils/promise";
import {findIndex} from "lodash";
import Loading from "components/Loading";

class Content extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			data        : [],
			params      : {
				total    : 0,
				pageSize : 20,
				current  : 1
			},
			hasMore     : false,
			loadingMore : false,
			loading     : false,
		};

		const endpoint = this.api.route('user.notifications.table').url();
		this.pagination = new Pagination(this.api, endpoint);
	}

	componentDidMount() {
		this.fetchNotifications();
	}

	fetchNotifications = () => {
		const {params} = this.state;
		const nextParams = {...params, current : 1};

		this.pagination.fetchData(
			nextParams, {}, (page) => {
				this.setState(() => {
					return {
						data    : page.data,
						params  : {...nextParams, total : page.total},
						loading : false,
						hasMore : Boolean(page.next_page_url),
					}
				})
			}, () => {
				this.setState({loading : false})
			}
		);

		this.setState({loading : true});
	};

	componentWillUnmount() {
		this.api.cancel();
	}

	canLoadMore() {
		const {hasMore, loadingMore, loading} = this.state;
		return (hasMore && !loadingMore && !loading);
	}

	onLoadMore = () => {
		if (!this.canLoadMore()) return;

		const {params} = this.state;
		let nextParams = {...params, current : params.current + 1};

		this.pagination.fetchData(
			nextParams, {}, (page) => {
				this.setState(({data}) => {
					return {
						data        : data.concat(page.data),
						params      : {...nextParams, total : page.total},
						loadingMore : false,
						hasMore     : Boolean(page.next_page_url),
					}
				})
			}, () => {
				this.setState({loadingMore : false})
			}
		);

		this.setState({loadingMore : true});
	};

	setScrollWrapper = (ref) => {
		if (ref !== this.scrollWrapper && ref !== null) {
			const simpleBar = new SimpleBar(ref);
			this.scrollParent = simpleBar.getScrollElement();
			this.scrollWrapper = ref
		}
	};

	updateItem(item) {
		const {data} = this.state;
		const index = findIndex(data, function (o) {
			return o.id === item.id;
		});
		let notifications = [...data];
		if (index < 0) {
			notifications = notifications.concat(item)
		} else {
			notifications[index] = item;
		}
		this.setState({data : notifications});
	}

	markAsRead = (item) => {
		const {axios, route} = this.api;
		const endpoint = route('user.notifications.mark-as-read', {
			notification : item.id
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.updateItem(data);
			}))
			.catch(error => handleError(error));
	};

	markAllAsRead = () => {
		const {axios, route} = this.api;
		const endpoint = route('user.notifications.mark-all-as-read');

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.fetchNotifications();
			}))
			.catch(error => handleError(error));
	};

	render() {
		const {data, loading, loadingMore, hasMore} = this.state;

		return (
			<React.Fragment>
				<div className="cp-popover-header">
					<h3 className="mb-0">
						<FormattedMessage
							defaultMessage="Notifications"
							id="common.notifications"/>
					</h3>

					<i className="cp-icon-btn cp-fs-xl la la-check-circle"
					   onClick={this.markAllAsRead}/>
				</div>

				<Spin spinning={loading}>
					<div ref={this.setScrollWrapper}
					     className="cp-popover-scroll"
					     data-simplebar={true}>
						<ul className="cp-sub-popover">
							<InfiniteScroll useWindow={false}
							                getScrollParent={() => this.scrollParent}
							                loadMore={this.onLoadMore}
							                pageStart={1}
							                hasMore={!loadingMore && hasMore}
							                initialLoad={false}>
								<List dataSource={data}
								      rowKey={(record) => record.id}
								      renderItem={item => {
									      return <NotificationItem onMarkAsRead={() => this.markAsRead(item)}
									                               notification={item}/>;
								      }}/>
								{loadingMore && <Loading/>}
							</InfiniteScroll>
						</ul>
					</div>
				</Spin>
			</React.Fragment>
		);
	}
}

export default Content;

