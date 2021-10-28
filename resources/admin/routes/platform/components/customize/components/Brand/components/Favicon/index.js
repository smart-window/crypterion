import React, {Component} from 'react';
import Widget from "admin/components/Widget";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import ApiService, {uploadRequest} from "admin/support/Services/Api";
import {Button, Col, message as messageApi, Row, Tag, Upload} from "antd";
import {pipe} from "admin/support/utils/common";
import {has} from "lodash";

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

class Favicon extends Component {
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
		const status = file.type === 'image/x-icon';

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

		const endpoint = route('admin.platform.customize.brand.upload-favicon').url();

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Favicon"
						id="admin.brand.favicon"/>
				}>
				<Row gutter={8}>
					<Col sm={4} className="mb-3">
						<span className="font-weight-medium">
							<FormattedMessage
								defaultMessage="Favicon"
								id="common.favicon"/>
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
									accept=".ico">
									<Button type="primary" icon="upload"
									        shape="round" loading={uploading}>
										<span>
											<FormattedMessage
												defaultMessage="Upload Favicon"
												id="admin.upload_favicon"/>
										</span>
									</Button>
								</Upload>
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
								"File Type: {type}"
							}
							values={{
								type : <b>ICO</b>,
							}}
							id="admin.brand.favicon_requirement"/>
					</span>
				</div>
			</Widget>
		);
	}
}

export default pipe(
	injectIntl,
)(Favicon);