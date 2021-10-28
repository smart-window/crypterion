import React, {Component} from 'react';
import {Badge, Icon, Input, List, Spin} from "antd";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import UserAvatar from "components/UserAvatar";
import ChatCell from "./components/ChatCell";
import InfiniteScroll from "react-infinite-scroller";
import {pipe, sortDate} from "support/utils/common";
import ApiService from "support/Services/Api";
import Pagination from "support/Helpers/Pagination";
import Auth from "support/Auth";
import {connect} from "react-redux";
import Loading from "components/Loading";
import {generatePath, withRouter} from "react-router-dom";
import SimpleBar from "simplebar";
import PrivateBroadcast from "support/Services/Broadcast/Private";
import {findIndex, isEmpty, uniqBy} from "lodash";
import {handleError, handleSuccess} from "support/utils/promise";
import menuItemLinks from "containers/utils/menuItemLinks";

const Item = List.Item;

const messages = defineMessages({
	searchUsers : {
		defaultMessage : "Filter by contact name...",
		id             : "chats.input_filter_by_contact_name_placeholder"
	},
});

class Menu extends Component {
	constructor(props) {
		super(props);

		this.broadcast = new PrivateBroadcast();
		this.api = new ApiService();

		this.state = {
			data        : [],
			hasMore     : false,
			params      : {
				total    : 0,
				pageSize : 20,
				current  : 1
			},
			filters     : {
				user : "",
			},
			loadingMore : false,
			loading     : false,
		};

		const endpoint = this.api.route('chats.table').url();
		this.pagination = new Pagination(this.api, endpoint);
	}

	componentDidMount() {
		this.bindBroadcastEvents();
		this.fetchChats();
	}

	bindBroadcastEvents() {
		this.resetBroadcastChannel();
		this.broadcast.listen('ChatParticipantCreated', this.chatParticipantCreatedListener);
	}

	chatParticipantCreatedListener = (e) => {
		const {axios, route} = this.api;
		if (isEmpty(e.participant)) return;

		const endpoint = route('chats.get', {
			chat : e.participant.chat_id
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (chat) => {
				this.setState(({data}) => {
					const chats = data.concat(chat);
					return {
						data : this.sortChats(chats)
					}
				});
			}))
			.catch(error => handleError(error));
	};

	onChatUpdated = (chat) => {
		const {data} = this.state;
		const index = findIndex(data, function (o) {
			return o.id === chat.id
		});

		let chats = [...data];
		if (index < 0) {
			chats = chats.concat(chat);
		} else {
			chats[index] = chat;
		}

		chats = this.sortChats(chats);
		this.setState({data : chats});
	};

	sortChats = (chats) => {
		if (!Array.isArray(chats)) return chats;
		chats = chats.sort((a, b) => sortDate(b.updated_at, a.updated_at));
		return uniqBy(chats, 'id');
	};

	resetBroadcastChannel() {
		const {auth} = this.props;
		if (auth.check()) {
			this.broadcast.setChannel('Auth.User.' + auth.user.id)
		} else {
			this.broadcast.unbind();
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		const prevUser = prevProps.auth.user;
		const user = this.props.auth.user;

		if (prevUser.id !== user.id) {
			console.info('Menu Updated');
			this.resetBroadcastChannel();
		}
	}

	fetchChats = () => {
		const {params, filters} = this.state;
		const nextParams = {...params, current : 1};

		this.pagination.fetchData(
			nextParams, filters, (page) => {
				this.setState(() => {
					return {
						params  : {...nextParams, total : page.meta.total},
						data    : page.data,
						loading : false,
						hasMore : Boolean(page.links.next),
					}
				})
			}, () => {
				this.setState({loading : false})
			}
		);

		this.setState({loading : true});
	};

	componentWillUnmount() {
		this.broadcast.unbind();
		this.api.cancel();
	}

	canSearchUser() {
		const {loading, loadingMore} = this.state;
		return !(loading || loadingMore);
	}

	canLoadMore() {
		const {hasMore, loadingMore, loading} = this.state;
		return (hasMore && !loadingMore && !loading);
	}

	onChangeUserSearch = (e) => {
		const value = e.target.value;
		clearTimeout(this.searching);

		const {filters} = this.state;
		if (!this.canSearchUser()) return;

		this.setState({
			filters : {...filters, user : value}
		});

		this.searching = setTimeout(
			this.fetchChats, 2000
		);
	};

	onSearchKeyUp = (e) => {
		if (e.key === 'Enter') {
			clearTimeout(this.searching);
			this.fetchChats();
		}
	};

	onLoadMore = (page) => {
		if (!this.canLoadMore()) return;

		const {params, filters} = this.state;
		let nextParams = {...params, current : params.current + 1};

		this.pagination.fetchData(
			nextParams, filters, (page) => {
				this.setState(({data}) => {
					const updatedData = data.concat(page.data);

					return {
						data        : this.sortChats(updatedData),
						params      : {...nextParams, total : page.meta.total},
						loadingMore : false,
						hasMore     : Boolean(page.links.next),
					}
				})
			}, () => {
				this.setState({loadingMore : false})
			}
		);

		this.setState({loadingMore : true});
	};

	handleChatOpen = (chat) => {
		const {history} = this.props;

		const path = generatePath(menuItemLinks['chat.view'].path, {
			token : chat.id
		});

		if (!isEmpty(history)) {
			return history.replace(path);
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
		const {loading, loadingMore, hasMore, filters, data} = this.state;

		const {intl, auth, activeChat} = this.props;

		const totalActiveTrades = auth.user.marketplace_stats.total_active_trades;

		return (
			<div className="cp-chat-sidenav-main">
				<div className="cp-chat-sidenav-header">
					<div className="cp-chat-user-hd">
						<div className="cp-chat-avatar mr-3">
							<UserAvatar user={auth.user}
							            showPresence={false}
							            size={50}/>
						</div>

						<div className="cp-module-user-info flex-column justify-content-center">
							<div className="cp-module-title">
								<h5 className="mb-0">
									<FormattedMessage
										defaultMessage="Conversations"
										id="chats.conversations"/>
								</h5>
							</div>
							<div className="cp-module-user-detail">
								<div className="cp-text-grey d-flex my-1 align-items-center">
									{totalActiveTrades > 0 && (
										<Badge count={totalActiveTrades}
										       style={{backgroundColor : '#2db7f5'}}
										       className="mb-0 mr-2"/>
									)}

									<span>
										<FormattedMessage
											defaultMessage="Active Trades"
											id="common.active_trades"/>
									</span>
								</div>
							</div>
						</div>
					</div>

					<div className="cp-chat-search-wrapper">
						<Input suffix={<Icon type="search"/>}
						       placeholder={intl.formatMessage(messages.searchUsers)}
						       size="large"
						       onKeyUp={this.onSearchKeyUp}
						       disabled={!this.canSearchUser()}
						       onChange={this.onChangeUserSearch}
						       value={filters.user}/>
					</div>
				</div>

				<div className="cp-chat-sidenav-content">
					<Spin spinning={loading}>
						<div ref={this.setScrollWrapper}
						     className="cp-chat-sidenav-scroll"
						     data-simplebar={true}>
							<InfiniteScroll useWindow={false}
							                getScrollParent={() => this.scrollParent}
							                loadMore={this.onLoadMore}
							                pageStart={1}
							                hasMore={!loadingMore && hasMore}
							                initialLoad={false}>
								<div className="cp-chat-user">
									<List
										dataSource={data}
										rowKey={(record) => record.id}
										renderItem={item => {
											return (
												<Item className="p-0">
													<ChatCell
														onChatUpdated={this.onChatUpdated}
														active={activeChat && activeChat.token === item.id}
														auth={auth} chat={item}
														onOpen={this.handleChatOpen}/>
												</Item>
											);
										}}/>
								</div>
								{loadingMore && <Loading/>}
							</InfiniteScroll>
						</div>
					</Spin>
				</div>
			</div>
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
)(Menu);