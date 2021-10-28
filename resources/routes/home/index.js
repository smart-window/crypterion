import React, {Component} from 'react';
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import WidgetGridLayout from "components/WidgetGridLayout";
import ApiService from "support/Services/Api";
import {handleError, handleSuccess} from "support/utils/promise";
import context from "context";
import widgets from "./widgets";
import {assign, filter, find, forEach, forOwn, has, isEmpty, isNull, isObject, keys, map, some, uniqBy} from "lodash";
import {Helmet} from "react-helmet";
import {Button, Icon, PageHeader, Popover, Spin} from "antd";
import {connect} from "react-redux";
import {pipe} from "support/utils/common";
import Auth from "support/Auth";
import Loading from "components/Loading";

const messages = defineMessages({
	pageTitle : {
		defaultMessage : "Home | {name}",
		id             : "meta.title.home"
	},

	layoutSaved : {
		defaultMessage : "Layout was saved.",
		id             : "common.layout_saved"
	},
});

const columns = {
	xs : 1,
	sm : 2,
	md : 3,
	lg : 3,
	xl : 4
};

class Home extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			data       : [],
			loading    : false,
			dimensions : {},
			editable   : false,
			saving     : false,
		}
	}

	componentDidMount() {
		this.fetchData();
	}

	fetchData() {
		const {axios, route} = this.api;
		const endpoint = route('home.widget.list');

		this.setState({loading : true});

		axios.get(endpoint.url())
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					data       : data,
					dimensions : this.buildDimensions(data),
					loading    : false,
					editable   : false
				});
			}))

			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	resetDimensions() {
		this.setState(({data}) => {
			return {
				dimensions : this.buildDimensions(data)
			}
		});
	}

	buildDimensions = (data) => {
		const dimensions = {};
		data = map(data, (o) => {
			dimensions[o.name] = [];

			return assign({}, o, {
				isValid : this.validateDimensions(o.dimensions)
			})
		});
		forOwn(columns, (breakpointCols, breakpoint) => {
			let nextX = 0, nextY = 0, nextH = 0;

			forEach(data, (w) => {
				const cols = this.parseUnit(w.cols, breakpointCols);
				const minCols = this.parseUnit(w.min_cols, breakpointCols);
				const maxCols = this.parseUnit(w.max_cols, breakpointCols);
				const rows = this.parseUnit(w.rows);
				const minRows = this.parseUnit(w.min_rows);
				const maxRows = this.parseUnit(w.max_rows);

				if (isNull(cols) || isNull(rows)) return;

				const defaultDimension = w.isValid && find(w.dimensions, (o) => {
					return o.breakpoint === breakpoint
				});

				if (isEmpty(defaultDimension)) {
					const dimension = {
						breakpoint  : breakpoint,
						isResizable : w.resizable,
						w           : cols,
						h           : rows,
					};

					if (nextX + cols <= breakpointCols) {
						dimension.x = nextX;
						dimension.y = nextY;

						nextX = dimension.x + dimension.w;
						nextH = Math.max(nextH, dimension.h);
						nextY = dimension.y;
					} else {
						dimension.x = 0;
						dimension.y = nextY + nextH;

						nextY = dimension.y;
						nextH = dimension.h;
						nextX = dimension.w;
					}

					if (!isNull(minCols)) dimension.minW = minCols;
					if (!isNull(maxCols)) dimension.maxW = maxCols;
					if (!isNull(minRows)) dimension.minH = minRows;
					if (!isNull(maxRows)) dimension.maxH = maxRows;

					dimensions[w.name].push(dimension);
				} else {
					nextH = Math.max(nextH, defaultDimension.h);
					nextX = defaultDimension.x + defaultDimension.w;
					nextY = defaultDimension.y;
					dimensions[w.name].push(defaultDimension);
				}
			});
		});
		return dimensions;
	};

	buildGridItem(dimensions) {
		const {editable} = this.state;
		const enabledKeys = keys(dimensions);
		const {auth} = this.props;

		const items = filter(widgets, (o) => {
			return isObject(o.component) &&
				enabledKeys.includes(o.name) && (
					typeof o.canShow !== "function" ||
					o.canShow(auth) || editable
				)
		});

		return uniqBy(items, (o) => {
			return o.name
		});
	}

	validateDimensions = (dimensions) => {
		return !isEmpty(dimensions) && !some(dimensions, (o) => {
			return !(
				has(o, 'x') && this.validateUnit(o.x)
			) || !(
				has(o, 'y') && this.validateUnit(o.y)
			) || !(
				has(o, 'w') && this.validateUnit(o.w)
			) || !(
				has(o, 'h') && this.validateUnit(o.h)
			);
		});
	};

	validateUnit = (n) => {
		return typeof n === "number" && !isNaN(n);
	};

	parseUnit = (number, limit) => {
		if (!this.validateUnit(number)) {
			return null;
		} else if (this.validateUnit(limit)) {
			return Math.min(number, limit);
		} else {
			return number;
		}
	};

	getPageTitle() {
		const {intl} = this.props;
		return intl.formatMessage(messages.pageTitle, {
			name : context.name
		})
	}

	editLayout = () => {
		this.resetDimensions();
		this.setState({editable : true});
	};

	saveLayout = () => {
		const {dimensions} = this.state;
		const {axios, route} = this.api;
		const {intl} = this.props;
		const endpoint = route('home.widget.set-dimensions');

		axios.post(endpoint.url(), {dimensions})
			.then(response => handleSuccess(response, () => {
				this.setState({saving : false});
				this.fetchData();
			}, intl.formatMessage(messages.layoutSaved)))
			.catch(error => handleError(error, () => {
				this.setState({saving : false});
			}));

		this.setState({saving : true});
	};

	handleDimensionChange = (dimensions) => {
		this.setState({dimensions})
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {auth, intl} = this.props;
		const {dimensions, loading, editable, saving} = this.state;
		const items = this.buildGridItem(dimensions);

		return (
			<React.Fragment>
				<Helmet>
					<title>
						{this.getPageTitle()}
					</title>
				</Helmet>

				{!isEmpty(items) ? (
					<Spin spinning={loading}>
						<WidgetGridLayout
							dimensions={dimensions}
							key={items.length}
							onDimensionChange={this.handleDimensionChange}
							cols={columns}
							isDraggable={editable}
							isResizable={editable}>
							{items.map((item) => {
								const Component = item.component;

								return (
									<div key={item.name}>
										<Component auth={auth} intl={intl}/>
									</div>
								)
							})}
						</WidgetGridLayout>
					</Spin>
				) : (
					loading && <Loading/>
				)}

				{auth.can("manage_customization") && (
					<PageHeader
						title={
							<span className="d-flex align-items-center">
								<span className="mr-2 font-weight-normal">
									<FormattedMessage
										defaultMessage="Manage Widgets"
										id="common.manage_widgets"/>
								</span>

								<span>
									<Popover trigger="click"
									         overlayStyle={{maxWidth : 250}}
									         content={
										         <FormattedMessage
											         defaultMessage={
												         "Layouts can be set for different screen sizes. " +
												         "You may use your browser's developer menu to emulate different screen sizes, " +
												         "in order to set different layouts."
											         }
											         id="common.widgets_customization_info"/>
									         }>
										<Icon type="question-circle" theme="filled"/>
									</Popover>
								</span>
							</span>
						}
						extra={[
							!editable ? (
								<Button key="edit" shape="round"
								        onClick={this.editLayout}
								        icon="edit">
									<span>
										<FormattedMessage
											defaultMessage="Edit"
											id="common.edit"/>
									</span>
								</Button>
							) : (
								<Button key="edit" shape="round"
								        onClick={this.saveLayout}
								        icon="save" type="primary"
								        loading={saving}>
									<span>
										<FormattedMessage
											defaultMessage="Save"
											id="common.save"/>
									</span>
								</Button>
							)
						]}
						avatar={{icon : "build", className : "cp-bg-primary"}}
						className="mt-3"/>
				)}
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
	injectIntl
)(Home);

if (module.hot) {
	module.hot.accept()
}