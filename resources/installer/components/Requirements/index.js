import React, {Component} from "react";
import ApiService from "installer/support/Services/Api";
import {FormattedMessage} from "react-intl";
import {Alert, Button, Col, Form, List, Row, Spin} from "antd";
import {handleError, handleSuccess} from "installer/support/utils/promise";
import {every} from "lodash"

class Requirements extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			core        : [],
			permissions : [],
			php         : [],
			loading     : false
		};
	}

	fetchData() {
		const {licenseDetails} = this.props;
		const {axios, route} = this.api;
		const endpoint = route('installer.requirement.data');
		this.setState({loading : true});

		axios.post(endpoint.url(), {license : licenseDetails})
			.then(response => handleSuccess(response, (data) => {
				this.setState({
					loading     : false,
					core        : data.core || [],
					permissions : data.permissions || [],
					php         : data.php || [],
				});
			}))
			.catch(error => handleError(error, () => {
				this.setState({loading : false});
			}));
	}

	validate() {
		const {core, permissions, php} = this.state;
		return every(core, (o) => o.status) &&
			every(permissions, (o) => o.status) &&
			every(php, (o) => o.status)
	};

	triggerSuccess = () => {
		const {onValidate} = this.props;
		if (typeof onValidate === "function") {
			return onValidate();
		}
	};

	prev = () => {
		const {onPrev} = this.props;
		if (typeof onPrev === "function") {
			return onPrev();
		}
	};

	componentWillUnmount() {
		this.api.cancel()
	}

	render() {
		const {visible, documentation} = this.props;
		const {loading, core, permissions, php} = this.state;
		return (
			<div className={`${visible ? 'd-block' : 'd-none'}`}>
				<div className="text-center mb-4">
					<h1>
						<FormattedMessage
							defaultMessage="Server Requirements"
							id="installer.server_requirements"/>
					</h1>
				</div>

				<Row>
					<Col xl={16} className="mb-3">
						<Spin spinning={loading}>
							<div className="mb-3">
								<h2>
									<FormattedMessage
										defaultMessage="Core"
										id="installer.core"/>
								</h2>

								<List dataSource={core}
								      renderItem={item => (
									      <List.Item>
										      <List.Item.Meta title={item.name}/>
										      {item.status ? (
											      <span className="cp-fs-xl cp-text-green">
												      {item.current} ({item.required})
											      </span>
										      ) : (
											      <span className="cp-fs-xl cp-text-red">
												      {item.current} ({item.required})
											      </span>
										      )}
									      </List.Item>
								      )}/>
							</div>

							<div className="mb-3">
								<h2>
									<FormattedMessage
										defaultMessage="PHP Requirements"
										id="installer.php_requirements"/>
								</h2>

								<List dataSource={php}
								      renderItem={item => (
									      <List.Item>
										      <List.Item.Meta title={item.name}/>
										      {item.status ? (
											      <i className="la la-check-circle cp-fs-xl cp-text-green"/>
										      ) : (
											      <i className="la la-times cp-fs-xl cp-text-red"/>
										      )}
									      </List.Item>
								      )}/>
							</div>

							<div className="mb-3">
								<h2>
									<FormattedMessage
										defaultMessage="Writable Permissions"
										id="installer.writable_permissions"/>
								</h2>

								<List dataSource={permissions}
								      renderItem={item => (
									      <List.Item>
										      <List.Item.Meta
											      title={
												      <React.Fragment>
													      <span className="mr-2">
														      {item.name}
													      </span>
													      {item.recursive && (
														      <i className="la la-sitemap cp-fs-lg"/>
													      )}
												      </React.Fragment>
											      }/>
										      {item.status ? (
											      <i className="la la-check-circle cp-fs-xl cp-text-green"/>
										      ) : (
											      <i className="la la-times cp-fs-xl cp-text-red"/>
										      )}
									      </List.Item>
								      )}/>
							</div>

							<Form.Item className="mt-4 text-right">
								<Button shape="round"
								        onClick={this.prev}>
									<span>
										<FormattedMessage
											defaultMessage="Previous"
											id="installer.previous"/>
									</span>
								</Button>

								{this.validate() ? (
									<Button type="primary" shape="round"
									        onClick={this.triggerSuccess}>
										<span>
											<FormattedMessage
												defaultMessage="Next"
												id="installer.next"/>
										</span>
									</Button>
								) : (
									<Button shape="round"
									        onClick={() => this.fetchData()}>
										<span>
											<FormattedMessage
												defaultMessage="Refresh"
												id="installer.refresh"/>
										</span>
									</Button>
								)}
							</Form.Item>
						</Spin>
					</Col>

					<Col xl={8}>
						<div className="px-xl-3 ml-xl-3 cp-border-left-xl">
							<h2>
								<FormattedMessage
									defaultMessage="About this page"
									id="installer.about_page"/>
							</h2>

							<p className="text-justify">
								<FormattedMessage
									defaultMessage={
										"We need to validate a few server requirements for your installation to " +
										"run properly."
									}
									id="installer.requirements_information"/>
							</p>

							<Alert type="info"
							       message={
								       <FormattedMessage
									       id="installer.writable_permissions_info"
									       defaultMessage={
										       "Writable permissions for directories with the mark {mark} " +
										       "are checked {recursively}. You need to ensure that all files " +
										       "and folders within the specified directories are writable " +
										       "by the server"
									       }
									       values={{
										       mark        : (
											       <i className="la la-sitemap cp-fs-lg"/>
										       ),
										       recursively : (
											       <b>
												       <FormattedMessage
													       defaultMessage="Recursively"
													       id="installer.recursively"/>
											       </b>
										       )
									       }}/>
							       }
							       showIcon/>

							<p className="text-center my-3">
								<Button type="default" shape="round"
								        href={documentation}
								        size="large" icon="file-word">
									<span>
										<FormattedMessage
											defaultMessage="Documentation"
											id="installer.documentation"/>
									</span>
								</Button>
							</p>
						</div>
					</Col>
				</Row>
			</div>
		);
	}
}

export default Requirements;