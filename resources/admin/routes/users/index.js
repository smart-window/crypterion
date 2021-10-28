import React, {Component} from 'react';
import {Checkbox, Drawer, Icon, Input, Spin, Tooltip} from "antd";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import {pipe} from "admin/support/utils/common";
import Pagination from "admin/support/Helpers/Pagination";
import UserTile from "./components/UserTile";
import ApiService from "admin/support/Services/Api";
import UserList from "./components/UserList";
import {assign, difference, findIndex, map, remove, startCase, union} from "lodash";
import {handleError, handleSuccess} from "admin/support/utils/promise";
import ConfirmAction from "admin/components/ConfirmAction";
import InfiniteScroll from "react-infinite-scroller";
import SimpleBar from "simplebar";
import Loading from "admin/components/Loading";
import DateInput from "./components/DateInput";

const messages = defineMessages({
	searchUsers      : {
		defaultMessage : "Search users...",
		id             : "admin.search_users_placeholder"
	},
	actionSuccessful : {
		defaultMessage : "Your action was successful.",
		id             : "admin.users_action_successful"
	},
});

class Users extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			roles         : [],
			drawerState   : false,
			data          : [],
			filters       : {
				name   : "",
				status : null,
				role   : null
			},
			hasMore       : false,
			view          : "tile",
			selectedData  : [],
			params        : {
				total    : 0,
				pageSize : 20,
				current  : 1
			},
			showDateInput : false,
			loading       : false,
			loadingMore   : false,
		};

		const route = this.api.route('admin.users.table').url();
		this.pagination = new Pagination(this.api, route);
	}

	componentDidMount() {
		this.fetchUsers();
		this.fetchRoles();
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

	fetchUsers = () => {
		this.setState({loading : true});

		const {params, filters} = this.state;

		this.pagination.fetchData(
			params, filters, (page) => {
				this.setState((state) => {
					return {
						data    : page.data,
						loading : false,
						hasMore : !!page.next_page_url,
						params  : {
							...state.params,
							total : page.total
						},
					}
				})
			}, () => {
				this.setState({loading : false})
			}
		)
	};

	canLoadMore() {
		const {hasMore, loadingMore, loading} = this.state;
		return (hasMore && !loadingMore && !loading);
	}

	onLoadMore = () => {
		if (!this.canLoadMore()) return;

		const {params, filters} = this.state;
		let nextParams = {...params, current : params.current + 1};

		this.setState({loadingMore : true});

		this.pagination.fetchData(
			nextParams, filters, (page) => {
				this.setState(({data}) => {
					return {
						data        : data.concat(page.data),
						params      : {...nextParams, total : page.total},
						loadingMore : false,
						hasMore     : !!page.next_page_url,
					}
				})
			}, () => {
				this.setState({loadingMore : false})
			}
		)
	};

	fetchRoles = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.users.roles');

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({roles : data});
			}))
			.catch(error => handleError(error));
	};

	setView(view) {
		this.setState({view : view})
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
		let users = [...this.state.data];
		const index = findIndex(users, function (o) {
			return o.id === item.id;
		});
		if (index < 0) {
			users = users.concat(item)
		} else {
			users[index] = item;
		}
		this.setState({data : users});
	}

	removeItem(item) {
		const users = [...this.state.data];
		const index = findIndex(users, function (o) {
			return o.id === item.id;
		});
		if (index >= 0) {
			remove(users, function (v, i) {
				return i === index;
			});
		}
		this.setState({data : users});
	}

	onSelectAllData = (e) => {
		this.setState({
			selectedData : e.target.checked ? this.dataKeys() : []
		})
	};

	canSearchUser() {
		const {loading, loadingMore} = this.state;
		return !loading && !loadingMore;
	}

	onSearchChange = (e) => {
		const value = e.target.value;
		clearTimeout(this.searching);

		const {params, filters} = this.state;
		if (!this.canSearchUser()) return;

		this.setState({
			filters : assign(filters, {name : value}),
			params  : assign(params, {current : 1}),
		});

		this.searching = setTimeout(
			this.fetchUsers, 2000
		);
	};

	onSearchKeyUp = (e) => {
		if (e.key === 'Enter') {
			clearTimeout(this.searching);
			this.fetchUsers();
		}
	};

	applyRoleFilter = (role) => {
		const {loading, loadingMore} = this.state;
		if (loading || loadingMore) return;

		this.setState({
			params  : assign(this.state.params, {current : 1}),
			filters : assign(this.state.filters, {role})
		}, () => {
			this.fetchUsers();
		});
	};

	clearRoleFilter = () => {
		const {loading, loadingMore} = this.state;
		if (loading || loadingMore) return;

		this.setState({
			params  : assign(this.state.params, {current : 1}),
			filters : assign(this.state.filters, {role : null})
		}, () => {
			this.fetchUsers();
		});
	};

	applyStatusFilter = (status) => {
		const {loading, loadingMore} = this.state;
		if (loading || loadingMore) return;

		this.setState({
			params  : assign(this.state.params, {current : 1}),
			filters : assign(this.state.filters, {status})
		}, () => {
			this.fetchUsers();
		});
	};

	clearStatusFilter = () => {
		const {loading, loadingMore} = this.state;
		if (loading || loadingMore) return;

		this.setState({
			params  : assign(this.state.params, {current : 1}),
			filters : assign(this.state.filters, {status : null})
		}, () => {
			this.fetchUsers();
		});
	};

	activate = (item) => {
		const {axios, route} = this.api;
		const {intl} = this.props;
		const {filters} = this.state;
		const endpoint = route('admin.users.activate', {
			'user' : item.id
		});

		axios.post(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				if (!filters.status || filters.status === "active") {
					this.updateItem(data);
				} else {
					this.removeItem(item);
				}
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	activateAll = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.users.batch-activate');
		const {intl} = this.props;
		const {selectedData} = this.state;

		axios.post(endpoint.url(), {users : selectedData})
			.then(response => handleSuccess(response, (data) => {
				this.fetchUsers();
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	deactivate = (item, date) => {
		const {axios, route} = this.api;
		const {intl} = this.props;
		const {filters} = this.state;
		const endpoint = route('admin.users.deactivate', {
			'user' : item.id
		});

		axios.post(endpoint.url(), {date : date.format()})
			.then(response => handleSuccess(response, (data) => {
				if (!filters.status || filters.status === "inactive") {
					this.updateItem(data);
				} else {
					this.removeItem(item);
				}
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	changeRole = (item, roles) => {
		const {axios, route} = this.api;
		const {intl} = this.props;
		const endpoint = route('admin.users.change-role', {
			'user' : item.id
		});

		axios.post(endpoint.url(), {roles})
			.then(response => handleSuccess(response, (data) => {
				this.updateItem(data);
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	deactivateAll = (date) => {
		const {selectedData} = this.state;
		const {intl} = this.props;
		const {axios, route} = this.api;

		this.toggleDateInputVisibility();
		const endpoint = route('admin.users.batch-deactivate');

		axios.post(endpoint.url(), {users : selectedData, date : date.format()})
			.then(response => handleSuccess(response, () => {
				this.fetchUsers();
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	delete = (item) => {
		const {axios, route} = this.api;
		const {intl} = this.props;
		const endpoint = route('admin.users.delete', {
			'user' : item.id
		});

		axios.delete(endpoint.url())
			.then(response => handleSuccess(response, () => {
				this.removeItem(item);
			}, intl.formatMessage(messages.actionSuccessful)));
	};

	toggleDateInputVisibility = () => {
		this.setState(({showDateInput}) => {
			return {
				showDateInput : !showDateInput
			};
		})
	};

	deleteAll = () => {
		const {axios, route} = this.api;
		const endpoint = route('admin.users.batch-delete');
		const {selectedData} = this.state;
		const {intl} = this.props;


		axios.post(endpoint.url(), {users : selectedData})
			.then(response => handleSuccess(response, (data) => {
				this.fetchUsers();
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
		const {filters, roles} = this.state;

		return (
			<div className="cp-module-side">
				<div className="cp-module-side-header">
					<div className="cp-module-logo">
						<i className="la la-globe mr-2"/>
						<span>
							<FormattedMessage
								defaultMessage="User List"
								id="common.user_list"/>
						</span>
					</div>
				</div>

				<div className="cp-module-side-content">
					<div className="cp-module-side-scroll" data-simplebar={true}>

						{/*<div className="p-3">*/}
						{/*	<Button type="primary" block>*/}
						{/*		<i className="la la-plus"/>*/}
						{/*		<span className="ml-2">*/}
						{/*			<FormattedMessage*/}
						{/*				defaultMessage="Add User"*/}
						{/*				id="admin.add_user"/>*/}
						{/*		</span>*/}
						{/*	</Button>*/}
						{/*</div>*/}


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

									<span onClick={(e) => this.applyStatusFilter("active")}
									      className={`cp-link ${filters.status !== "active" ? "" : "active"}`}>
										<i className="la la-check-circle"/>
										<span>
											<FormattedMessage
												defaultMessage="Active"
												id="common.active"/>
										</span>
									</span>

									<span onClick={(e) => this.applyStatusFilter("inactive")}
									      className={`cp-link ${filters.status !== "inactive" ? "" : "active"}`}>
										<i className="la la-ban"/>
										<span>
											<FormattedMessage
												defaultMessage="Inactive"
												id="common.inactive"/>
										</span>
									</span>
								</li>

								<li className="mt-4">
									<div className="mx-4 mb-3 cp-fs-lg">
										<FormattedMessage
											defaultMessage="Filter By Role"
											id="admin.filter_by_role"/>
									</div>
								</li>

								<li className="cp-nav-item">
									<span className={`cp-link ${filters.role ? "" : "active"}`}
									      onClick={this.clearRoleFilter}>
										<i className="la la-list"/>
										<span>
											<FormattedMessage
												defaultMessage="All"
												id="common.all"/>
										</span>
									</span>

									{roles.map((role, index) => (
										<span className={`cp-link ${filters.role !== role.name ? "" : "active"}`}
										      key={index} onClick={(e) => this.applyRoleFilter(role.name)}>
											<i className="la la-certificate"/>
											<span>{startCase(role.name)}</span>
										</span>
									))}
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const {intl} = this.props;

		const {
			data, drawerState, loading,
			view, selectedData, filters,
			showDateInput, roles,
			hasMore, loadingMore
		} = this.state;

		return (
			<div className="cp-app-module">
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
							<div className="cp-search-bar d-none d-sm-block">
								<Input suffix={<Icon type="search"/>}
								       size="large"
								       placeholder={intl.formatMessage(messages.searchUsers)}
								       onKeyUp={this.onSearchKeyUp}
								       disabled={!this.canSearchUser()}
								       onChange={this.onSearchChange}
								       value={filters.name}/>
							</div>

							<div className="cp-module-box-header-right">
								{view !== "tile" ?
									<span className="cp-fs-xl">
										<i className="la la-table cp-icon-btn"
										   onClick={(e) => this.setView("tile")}/>
									</span> : null
								}

								{view !== "list" ?
									<span className="cp-fs-xl">
										<i className="la la-list cp-icon-btn"
										   onClick={(e) => this.setView("list")}/>
									</span> : null
								}
							</div>
						</div>
					</div>

					<div className="cp-module-box-content">
						<div className="cp-module-box-topbar justify-content-end">
							{selectedData.length > 0 ?
								<React.Fragment>
									<span className="mr-2">
										<FormattedMessage
											defaultMessage="Selected {count} users"
											id="admin.selected_count_users"
											values={{
												count : <b>{selectedData.length}</b>
											}}/>
									</span>
									{!filters.status || filters.status === "inactive" ?
										<Tooltip
											title={
												<FormattedMessage
													defaultMessage="Activate All"
													id="admin.activate_all"/>
											}>
											<i className="cp-icon-btn cp-fs-xl la la-check-circle"
											   onClick={this.activateAll}/>
										</Tooltip> : null
									}

									{!filters.status || filters.status === "active" ?
										<Tooltip
											title={
												<FormattedMessage
													defaultMessage="Deactivate All"
													id="admin.deactivate_all"/>
											}>
											<i className="cp-icon-btn cp-fs-xl la la-ban"
											   onClick={this.toggleDateInputVisibility}/>
										</Tooltip> : null
									}

									<DateInput
										visible={showDateInput}
										onCancel={this.toggleDateInputVisibility}
										onOk={this.deactivateAll}
										title={
											<FormattedMessage
												defaultMessage="Specify Expiry Date"
												id="admin.specify_expiry_date"/>
										}/>

									<Tooltip
										title={
											<FormattedMessage
												defaultMessage="Delete All"
												id="admin.delete_all"/>
										}>
										<ConfirmAction onConfirm={this.deleteAll}>
											<i className="cp-icon-btn cp-fs-xl la la-trash"/>
										</ConfirmAction>
									</Tooltip>
								</React.Fragment> : null
							}

							<Checkbox className="cp-icon-btn mr-0"
							          checked={this.dataKeys().length && selectedData.length === this.dataKeys().length}
							          indeterminate={selectedData.length && selectedData.length < this.dataKeys().length}
							          onChange={this.onSelectAllData}
							          color="primary"/>
						</div>


						<Spin spinning={loading}>
							<div ref={this.setScrollWrapper}
							     className="cp-module-content-scroll"
							     data-simplebar={true}>
								<InfiniteScroll useWindow={false}
								                getScrollParent={() => this.scrollParent}
								                loadMore={this.onLoadMore}
								                pageStart={1}
								                hasMore={!loadingMore && hasMore}
								                initialLoad={false}>
									{view === "tile" ?
										<UserTile data={data} roles={roles}
										          hasMore={hasMore}
										          loadingMore={loadingMore}
										          onSelectData={this.onSelectData}
										          onChangeRole={this.changeRole}
										          onActivate={this.activate}
										          onDeactivate={this.deactivate}
										          onDelete={this.delete}
										          onLoadMore={this.onLoadMore}
										          selectedData={selectedData}/> :
										<UserList data={data} roles={roles}
										          hasMore={hasMore}
										          loadingMore={loadingMore}
										          onSelectData={this.onSelectData}
										          onChangeRole={this.changeRole}
										          onActivate={this.activate}
										          onDeactivate={this.deactivate}
										          onDelete={this.delete}
										          onLoadMore={this.onLoadMore}
										          selectedData={selectedData}/>
									}
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

export default pipe(
	injectIntl
)(Users);

if (module.hot) {
	module.hot.accept()
}