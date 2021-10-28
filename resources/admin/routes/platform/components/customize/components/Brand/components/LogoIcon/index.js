import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService, {uploadRequest} from "admin/support/Services/Api";
import {Button, Col, message as messageApi, Row, Tag, Upload} from "antd";
import {pipe} from "admin/support/utils/common";
import {has} from "lodash";
import context from "admin/context";

const messages = defineMessages({
	successful : {
		defaultMessage : "Your upload was successful.",
		id             : "admin.brand.upload_successful"
	},

	invalidType : {
		defaultMessage : "Invalid file type selected.",
		id             : "admin.brand.invalid_file_type"
	},
});

class LogoIcon extends Component {
	constructor(props) {
		super(props);

		this.api = new ApiService();

		this.state = {
			uploading : false
		}
	}

	componentWillUnmount() {
		this.api.cancel();
	}

	beforeUpload = (file) => {
		const {intl} = this.props;
		const status = file.type === 'image/png';

		if (!status) {
			messageApi.error(intl.formatMessage(messages.invalidType));
		}
		this.setState({uploading : status});
		return status;
	};

	handleUploadError = (errors) => {
		this.setState({uploading : false});

		if (has(errors, 'file')) {
			errors.file.forEach(error => messageApi.error(error));
		}
	};

	handleUploadSuccess = () => {
		this.setState({uploading : false});
		const {intl} = this.props;
		messageApi.success(intl.formatMessage(messages.successful));
		window.location.reload();
	};

	render() {
		const {uploading} = this.state;
		const {route} = this.api;

		const endpoint = route('admin.platform.customize.brand.upload-logo-icon').url();

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Logo Icon"
						id="admin.brand.logo_icon"/>
				}>
				<Row gutter={8}>
					<Col sm={4} className="mb-3">
						<span className="font-weight-medium">
							<FormattedMessage
								defaultMessage="Logo Icon"
								id="common.logo_icon"/>
						</span>
					</Col>
					<Col sm={20}>
						<Row gutter={8}>
							<Col sm={12}>
								<Upload
									beforeUpload={this.beforeUpload}
									action={endpoint}
									customRequest={uploadRequest}
									withCredentials={true}
									onSuccess={this.handleUploadSuccess}
									showUploadList={false}
									onError={this.handleUploadError}
									accept=".png">
									<Button type="primary" icon="upload"
									        shape="round" loading={uploading}>
										<span>
											<FormattedMessage
												defaultMessage="Upload Logo Icon"
												id="admin.upload_logo_icon"/>
										</span>
									</Button>
								</Upload>
							</Col>

							<Col sm={12}>
								{!context.logoIconUrl ? (
									<React.Fragment>
										<h5>
											<FormattedMessage
												defaultMessage="Example"
												id="common.example"/>
										</h5>

										<div className="rounded p-2">
											<img alt={context.name} src={require("assets/images/logo-icon.png")}/>
										</div>
									</React.Fragment>
								): (
									<React.Fragment>
										<h5>
											<FormattedMessage
												defaultMessage="Current"
												id="common.current"/>
										</h5>

										<div className="rounded p-2">
											<img alt={context.name} src={context.logoIconUrl}/>
										</div>
									</React.Fragment>
								)}
							</Col>
						</Row>
					</Col>
				</Row>

				<div className="my-2">
					<Tag color="red">
						<FormattedMessage
							defaultMessage="Requirement"
							id="common.requirement"/>
					</Tag>

					<span className="d-inline-block">
						<FormattedMessage
							defaultMessage={
								"Max Width: {maxWidth}, Max Height: {maxHeight}, File Type: {type}"
							}
							values={{
								maxWidth  : <b>100px</b>,
								type      : <b>PNG</b>,
								maxHeight : <b>100px</b>,
							}}
							id="admin.brand.logo_icon_requirement"/>
					</span>
				</div>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
)(LogoIcon);