import React, {Component} from 'react';
import {pipe} from "admin/support/utils/common";
import {generatePath, matchPath, withRouter} from "react-router-dom";
import {Breadcrumb} from "antd";
import {assign, findKey, has, includes, isEmpty} from "lodash";
import links from "admin/containers/utils/menuItemLinks";

const Item = Breadcrumb.Item;

const exclude = [
	'home', 'users'
];

class PageBreadcrumb extends Component {
	prepareRoutes() {
		const {location} = this.props;

		const key = findKey(links, function (o) {
			return !!matchPath(location.pathname, {
				path : o.path, exact : true, strict : false
			});
		});

		if (!key || includes(exclude, key)) return null;

		const steps = key.split('.');
		const output = [];

		if (has(links, 'home')) {
			const url = links['home'].path;
			output.push(assign({}, links['home'], {url}))
		}

		for (let i = 0, keys = []; i < steps.length; i++) {
			keys.push(steps[i]);
			const nextKey = keys.join('.');
			this.addLinks(nextKey, output);
		}
		return output;
	}

	addLinks = (key, output) => {
		if (!(has(links, key) && key !== 'home')) return;

		const {location} = this.props;
		const link = links[key];

		const match = matchPath(location.pathname, {path : link.path});
		if (isEmpty(match)) return;

		const url = generatePath(link.path, match.params);
		output.push(assign({}, link, {url}))
	};

	goToLink(link) {
		const {history} = this.props;

		if (!isEmpty(history) && link) {
			return history.push(link)
		}
	}

	render() {
		const routes = this.prepareRoutes();
		if (!routes) return null;

		return (
			<div className="mb-4">
				<Breadcrumb separator="&raquo;">
					{routes.map((value, index) => {
						const isLast = routes.length === index + 1;

						return (
							<Item key={index}
							      onClick={() => !isLast && this.goToLink(value.url)}
							      className={`${!isLast && "cp-link"}`}>
								<span className="fs-xl mr-1">
									{value.icon}
								</span>

								<span className="fs-md ml-1">
									{value.text}
								</span>
							</Item>
						)
					})}
				</Breadcrumb>
			</div>
		);
	}
}

export default pipe(
	withRouter
)(PageBreadcrumb)