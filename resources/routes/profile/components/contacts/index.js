import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService from "support/Services/Api";
import Pagination from "support/Helpers/Pagination";
import {assign, difference, findIndex, map, remove, union} from "lodash";
import {Checkbox, Drawer, Icon, Input, Spin} from "antd";
import ConfirmAction from "components/ConfirmAction";
import UserList from "./components/UserList";
import {pipe} from "support/utils/common";
import Auth from "support/Auth";
import {connect} from "react-redux";
import {handleSuccess} from "support/utils/promise";
import InfiniteScroll from "react-infinite-scroller";
import Loading from "components/Loading";
import SimpleBar from "simplebar";
import {Helmet} from "react-helmet";
import context from "context";

const messages = defineMessages({
	searchUsers      : {
		defaultMessage : "Search users...",
		id             : "profile.contacts.search_users_placeholder"
	},
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "profile.contacts.action_successful"
	},
	chooseDate       : {
		defaultMessage : "Choose date...",
		id             : "profile.contacts.choose_date_placeholder"
	},
	invalidInput     : {
		defaultMessage : "You input was invalid, please try again!",
		id             : "profile.contacts.invalid_input_message"
	},
	pageTitle : {
		defaultMessage : "Contacts - Profile | {name}",
		id             : "meta.title.profile_contacts"
	},
});

class Contacts extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			drawerState  : false,
			data         : [],
			filters      : {
				name   : "",
				status : null,
			},
			hasMore      : false,
			selectedData : [],
			params       : {
				total    : 0,
				pageSize : 20,
				current  : 1
			},
			loading      : false,
			loadingMore  : false,
		};

		const route = this.api.route('user.contacts.table', {
			name : props.match.params.name
		}).url();

		this.pagination = new Pagination(this.api, route);
	}

	componentDidMount() {
		this.fetchContacts();
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	onToggleDrawer = () => {
		this.setState((state) => {
			return {
				drawerState : !state.drawerState
			};
		});
	};

	fetchContacts = () => {
		const {params, filters} = this.state;
		const nextParams = {...params, current : 1};

		this.setState({loading : true});

		this.pagination.fetchData(
			nextParams, filters, (page) => {
				this.setState(() => {
					return {
						data    : page.data,
						loading : false,
						hasMore : Boolean(page.links.next),
						params  : {
							...nextParams,
							total : page.meta.total
						},
					}
				})
			}, () => {
				this.setState({loading : false})
			}
		);
	};

	canLoadMore() {
		const {hasMore, loadingMore, loading} = this.state;
		return (hasMore && !loadingMore && !loading);
	}

	onLoadMore = () => {
		if(!this.canLoadMore()) return;

		const {params, filters} = this.state;
		let nextParams = {...params, current : params.current + 1};

		this.setState({loadingMore : true});

		this.pagination.fetchData(
			nextParams, filters, (page) => {
				this.setState(({data}) => {
					return {
						data        : data.concat(page.data),
						params      : {...nextParams, total : page.meta.total},
						loadingMore : false,
						hasMore     : Boolean(page.links.next),
					}
				})
			}, () => {
				this.setState({loadingMore : false})
			}
		)
	};

	componentDidUpdate(prevProps, prevState, snapshot) {
		const matchParams = this.props.match.params;
		const prevMatchParams = prevProps.match.params;
		if (matchParams.name !== prevMatchParams.name) {
			this.fetchContacts();
			console.log('Updated Contacts');
		}
	}

	dataKeys() {
		return map(this.state.data, 'id');
	}

	onSelectData = (e) => {
		const checkbox = e.target;

		if (!checkbox.checked) {
			this.setState(({selectedData}) => {
				return {
					selectedData : difference(selectedData, [checkbox.value])
				}
			});
		} else {
			this.setState(({selectedData}) => {
				return {
					selectedData : union(selectedData, [checkbox.value])
				}
			});
		}
	};

	updateItem(item) {
		const {data} = this.state;
		const index = findIndex(data, function (o) {
			return o.id === item.id;
		});
		const newData = [...data];
		if (index >= 0) newData[index] = item;
		this.setState({data : newData});
	}

	removeItem(item) {
		const {data} = this.state;
		const index = findIndex(data, function (o) {
			return o.id === item.id;
		});
		const newData = [...data];
		if (index >= 0) {
			remove(newData, function (v, i) {
				return i === index;
			});
		}
		this.setState({data : newData});
	}

	onSelectAllData = (e) => {
		this.setState({
			selectedData : e.target.checked ? this.dataKeys() : []
		})
	};

	canSearchContact() {
		const {loading, loadingMore} = this.state;
		return !loading && !loadingMore;
	}

	onSearchChange = (e) => {
		clearTimeout(this.searching);
		const value = e.target.value;

		const {params, filters} = this.state;
		if (!this.canSearchContact()) return;

		this.setState({
			filters : assign(filters, {name : value}),
			params  : assign(params, {current : 1}),
		});

		this.searching = setTimeout(
			this.fetchContacts, 2000
		);
	};

	onSearchKeyUp = (e) => {
		if (e.key === 'Enter') {
			clearTimeout(this.searching);
			this.fetchContacts();
		}
	};

	applyStatusFilter = (status) => {
		const {loading, loadingMore} = this.state;
		if (loading || loadingMore) return;

		this.setState({
			params  : assign(this.state.params, {current : 1}),
			filters : assign(this.state.filters, {status})
		}, () => {
			this.fetchContacts();
		});
	};

	clearStatusFilter = () => {
		const {loading, loadingMore} = this.state;
		if (loading || loadingMore) return;

		this.setState({
			params  : assign(this.state.params, {current : 1}),
			filters : assign(this.state.filters, {status : null})
		}, () => {
			this.fetchContacts();
		});
	};

	trust = (item) => {
		const {filters} = this.state;
		const {axios, route} = this.api;
		const {intl, auth} = this.props;
		const endpoint = route('user.contacts.trust', {
			'name' : auth.user.name
		});

		axios.post(endpoint.url(), {id : item.id})
			.then(response => handleSuccess(response, (data) => {
				if (!filters.status || filters.status === "trust") {
					this.updateItem(data);
				} else {
					this.removeItem(item);
				}
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	delete = (item) => {
		const {axios, route} = this.api;
		const {intl, auth} = this.props;
		const endpoint = route('user.contacts.remove', {
			'name' : auth.user.name
		});

		axios.post(endpoint.url(), {id : item.id})
			.then(response => handleSuccess(response, (data) => {
				this.removeItem(item);
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	deleteAll = () => {
		const {axios, route} = this.api;
		const {intl, auth} = this.props;

		const endpoint = route('user.contacts.batch-remove', {
			'name' : auth.user.name
		});

		const {selectedData} = this.state;

		axios.post(endpoint.url(), {users : selectedData})
			.then(response => handleSuccess(response, (data) => {
				this.fetchContacts();
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	block = (item) => {
		const {filters} = this.state;
		const {axios, route} = this.api;
		const {intl, auth} = this.props;
		const endpoint = route('user.contacts.block', {
			'name' : auth.user.name
		});

		axios.post(endpoint.url(), {id : item.id})
			.then(response => handleSuccess(response, (data) => {
				if (!filters.status || filters.status === "block") {
					this.updateItem(data);
				} else {
					this.removeItem(item);
				}
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	resetStatus = (item) => {
		const {filters} = this.state;
		const {axios, route} = this.api;
		const {intl, auth} = this.props;
		const endpoint = route('user.contacts.reset-status', {
			'name' : auth.user.name
		});

		axios.post(endpoint.url(), {id : item.id})
			.then(response => handleSuccess(response, (data) => {
				if (!filters.status) {
					this.updateItem(data);
				} else {
					this.removeItem(item);
				}
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	setScrollWrapper = (ref) => {
		if (ref !== this.scrollWrapper && ref !== null) {
			const simpleBar = new SimpleBar(ref);
			this.scrollParent = simpleBar.getScrollElement();
			this.scrollWrapper = ref
		}
	};

	sidebarComponent() {
		const {auth, match} = this.props;
		const {filters} = this.state;

		return (
			<div className="cp-module-side">
				<div className="cp-module-side-header">
					<div className="cp-module-logo">
						{auth.user.name !== match.params.name ? (
							<span>
								<FormattedMessage
									defaultMessage="Contacts"
									id="profile.contacts"/>
							</span>
						) : (
							<span>
								<FormattedMessage
									defaultMessage="My Contacts"
									id="profile.my_contacts"/>
							</span>
						)}
					</div>
				</div>

				<div className="cp-module-side-content">
					<div className="cp-module-side-scroll" data-simplebar={true}>
						<div className="cp-module-side-nav">
							<ul className="cp-module-nav">
								<li>
									<div className="mx-4 mb-3 cp-fs-lg">
										<FormattedMessage
											defaultMessage="Filter By Status"
											id="admin.filter_by_status"/>
									</div>
								</li>

								<li className="cp-nav-item">
									<span className={`cp-link ${filters.status ? "" : "active"}`}
									      onClick={this.clearStatusFilter}>
										<i className="la la-list"/>
										<span>
											<FormattedMessage
												defaultMessage="All"
												id="common.all"/>
										</span>
									</span>

									<span onClick={(e) => this.applyStatusFilter("trust")}
									      className={`cp-link ${filters.status !== "trust" ? "" : "active"}`}>
										<i className="la la-check-circle"/>
										<span>
											<FormattedMessage
												defaultMessage="Trusted"
												id="profile.contacts.trusted"/>
										</span>
									</span>

									<span onClick={(e) => this.applyStatusFilter("block")}
									      className={`cp-link ${filters.status !== "block" ? "" : "active"}`}>
										<i className="la la-ban"/>
										<span>
											<FormattedMessage
												defaultMessage="Blocked"
												id="profile.contacts.blocked"/>
										</span>
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}

	getPageTitle() {
		const {intl} = this.props;

		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	render() {
		const {intl} = this.props;

		const {
			data, drawerState,
			hasMore,  loading, loadingMore,
			selectedData, filters
		} = this.state;

		return (
			<div className="cp-app-module">
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				<div className="d-block d-lg-none">
					<Drawer onClose={this.onToggleDrawer}
					        placement="left"
					        closable={false}
					        visible={drawerState}>
						{this.sidebarComponent()}
					</Drawer>
				</div>

				<div className="cp-module-sidenav d-none d-lg-flex">
					{this.sidebarComponent()}
				</div>

				<div className="cp-module-box">
					<div className="cp-module-box-header">
						<span className="cp-drawer-btn d-flex d-lg-none">
							<i className="la la-ellipsis-v cp-icon-btn" aria-label="Menu"
							   onClick={this.onToggleDrawer}/>
						</span>

						<div className="cp-module-box-header-inner">
							<div className="cp-search-bar">
								<Input suffix={<Icon type="search"/>}
								       placeholder={intl.formatMessage(messages.searchUsers)}
								       onKeyUp={this.onSearchKeyUp}
								       size="large" value={filters.name}
								       disabled={!this.canSearchContact()}
								       onChange={this.onSearchChange}/>
							</div>
						</div>
					</div>

					<div className="cp-module-box-content">
						<div className="cp-module-box-topbar justify-content-end">
							{selectedData.length > 0 && (
								<React.Fragment>
									<span className="mr-2 d-none d-sm-inline">
										<FormattedMessage
											defaultMessage="Selected {count} contacts"
											id="profile.contacts.selected_count_contact"
											values={{
												count : <b>{selectedData.length}</b>
											}}/>
									</span>

									<span className="d-none d-sm-inline">
										<ConfirmAction onConfirm={this.deleteAll}>
											<i className="cp-icon-btn cp-fs-xl la la-trash"/>
										</ConfirmAction>
									</span>
								</React.Fragment>
							)}

							<span className="d-none d-sm-inline">
								<Checkbox className="cp-icon-btn mr-0"
								          checked={this.dataKeys().length && selectedData.length === this.dataKeys().length}
								          indeterminate={selectedData.length && selectedData.length < this.dataKeys().length}
								          onChange={this.onSelectAllData}
								          color="primary"/>
							</span>
						</div>


						<Spin spinning={loading}>
							<div ref={this.setScrollWrapper}
							     className="cp-module-content-scroll"
							     data-simplebar={true}>
								<InfiniteScroll useWindow={false}
								                loadMore={this.onLoadMore}
								                getScrollParent={() => this.scrollParent}
								                pageStart={1}
								                hasMore={!loadingMore && hasMore}
								                initialLoad={false}>
									<UserList data={data} hasMore={hasMore}
									          loadingMore={loadingMore}
									          onSelectData={this.onSelectData}
									          onLoadMore={this.onLoadMore}
									          onTrust={this.trust}
									          onDelete={this.delete}
									          onBlock={this.block}
									          onResetStatus={this.resetStatus}
									          selectedData={selectedData}/>
									{loadingMore ? <Loading/> : null}
								</InfiniteScroll>
							</div>
						</Spin>
					</div>
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
	injectIntl
)(Contacts);
