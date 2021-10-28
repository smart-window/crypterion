import React, {Component} from "react";
import {cold, hot, setConfig} from 'react-hot-loader';
import {Alert, Card, Col, Icon, Row, Spin, Steps} from "antd";
import {FormattedMessage} from "react-intl";
import License from "./components/License";
import Requirements from "installer/components/Requirements";
import Environment from "installer/components/Environment";
import Administrator from "installer/components/Administrator";
import Finish from "installer/components/Finish";

const {Step} = Steps;

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			licenseDetails : {},
			current        : 0,
		};
	}

	componentDidMount() {
		this.setSpinDefaultIndicator()
	}

	setSpinDefaultIndicator = () => {
		Spin.setDefaultIndicator(
			<Icon style={{fontSize : 24}}
			      spin type="loading"/>
		);
	};

	handleLicenseVerified = (licenseDetails) => {
		this.setState({licenseDetails}, () => {
			this.next(() => {
				this.requirements.fetchData();
			});
		})
	};

	handleRequirementsValidated = () => {
		this.next(() => {
			this.environment.fetchData();
		});
	};

	handleEnvironmentSaved = () => {
		this.next();
	};

	next(callback) {
		this.setState(({current}) => {
			return {current : current + 1}
		}, () => {
			this.scrollToTop();

			if (typeof callback === "function") {
				return callback();
			}
		});
	}

	prev() {
		this.setState(({current}) => {
			return {current : current - 1}
		}, () => {
			this.scrollToTop();
		});
	}

	scrollToTop = () => {
		if (typeof window !== "undefined") {
			window.scrollTo({
				top      : 0,
				behavior : 'smooth',
			})
		}
	};

	handleAdministratorRegistered = () => {
		this.next();
	};

	render() {
		const {current, licenseDetails} = this.state;
		const documentation = "//docs.crypterion.live/";

		return (
			<div className="installer">
				<Row className="d-flex justify-content-center">
					<Col xs={24} sm={16}>
						<div style={{borderRadius : '0 0 10px 10px'}}
						     className="d-inline-block p-3 cp-bg-white mx-auto">
							<img alt="Crypterion"
							     src={require('assets/images/logo-icon.png')}
							     style={{width : '40px', height : 'auto'}}/>
						</div>
						<Card bordered={false}
						      style={{boxShadow : '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'}}
						      className="mt-4 cp-card-widget">
							<div className="mb-5 d-none d-xl-flex">
								<Steps progressDot current={current}>
									<Step
										title={
											<FormattedMessage
												defaultMessage="License"
												id="installer.license"/>
										}/>
									<Step
										title={
											<FormattedMessage
												defaultMessage="Requirements"
												id="installer.requirements"/>
										}/>
									<Step
										title={
											<FormattedMessage
												defaultMessage="Environment"
												id="installer.environment"/>
										}/>
									<Step
										title={
											<FormattedMessage
												defaultMessage="Administrator"
												id="installer.administrator"/>
										}/>
									<Step
										title={
											<FormattedMessage
												defaultMessage="Finish"
												id="installer.finish"/>
										}/>
								</Steps>
							</div>

							{(typeof location !== "undefined" && location.protocol !== 'https:') && (
								<div className="mb-3">
									<Alert type="error"
									       message={
										       <span className="font-weight-medium">
											       <FormattedMessage
												       defaultMessage="HTTPS Connection is Highly Recommended."
												       id="installer.https_recommended"/>
										       </span>
									       }
									       description={
										       <FormattedMessage
											       defaultMessage={
												       "You need to setup an SSL certificate with this domain on your server, " +
												       "and its automatic redirection to the HTTPS protocol."
											       }
											       id="installer.https_recommended_desc"/>
									       }
									       showIcon/>
								</div>
							)}

							<License
								documentation={documentation}
								onVerify={this.handleLicenseVerified}
								visible={current === 0}/>

							<Requirements
								documentation={documentation}
								onPrev={() => this.prev()}
								ref={(ref) => this.requirements = ref}
								licenseDetails={licenseDetails}
								onValidate={this.handleRequirementsValidated}
								visible={current === 1}/>

							<Environment
								documentation={documentation}
								onPrev={() => this.prev()}
								wrappedComponentRef={(ref) => this.environment = ref}
								licenseDetails={licenseDetails}
								onSave={this.handleEnvironmentSaved}
								visible={current === 2}/>

							<Administrator
								documentation={documentation}
								onPrev={() => this.prev()}
								licenseDetails={licenseDetails}
								onRegister={this.handleAdministratorRegistered}
								visible={current === 3}/>

							<Finish
								licenseDetails={licenseDetails}
								visible={current === 4}/>
						</Card>
					</Col>
				</Row>
			</div>
		);
	}
}

setConfig({
	onComponentRegister : (type, name, file) => {
		return file.indexOf('node_modules') > 0 && cold(type)
	},

	logLevel : 'debug'
});

export default hot(module)(App);