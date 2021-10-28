import React, {Component} from 'react';
import {route, uploadRequest} from "support/Services/Api";
import Auth from "support/Auth";
import {pipe} from "support/utils/common";
import {Icon, message as messageApi, Modal, Upload} from "antd";
import {connect} from "react-redux";
import {defineMessages, FormattedMessage, injectIntl} from "react-intl";
import Widget from "components/Widget";
import {withRouter} from "react-router-dom";
import Cropper from 'cropperjs';
import {has} from "lodash";

const messages = defineMessages({
	successful : {
		defaultMessage : "Your upload was successful.",
		id             : "profile.upload_successful"
	},

	invalidType : {
		defaultMessage : "You can only upload JPG/PNG file!",
		id             : "profile.invalid_picture_type"
	},
});

class UploadPhoto extends Component {
	constructor(props) {
		super(props);

		this.cropperImg = React.createRef();
		this.controller = new AbortController();

		this.state = {
			loading      : false,
			showCropper  : false,
			previewSrc   : undefined,
			cropperSrc   : undefined,
			onCancelCrop : undefined,
			onOkCrop     : undefined,
		};
	}

	transformFile = (file) => {
		const component = this;
		const signal = this.controller.signal;

		return new Promise((resolve, reject) => {
			// Initialize FileReader which reads uploaded file
			let reader = new FileReader();

			reader.onloadend = function () {
				if (!signal.aborted) {
					component.setState({
						cropperSrc : reader.result
					}, () => {
						const {current} = component.cropperImg;

						// Initialize cropper for uploaded image
						const cropper = new Cropper(current, {
							aspectRatio        : 1,
							autoCropArea       : 1,
							movable            : false,
							cropBoxResizable   : true,
							// minContainerWidth  : '100%',
							minContainerHeight : 250,
							viewMode           : 1
						});

						if (!signal.aborted) {
							component.setState({
								onOkCrop     : function () {
									if (!signal.aborted) {
										let canvas = cropper.getCroppedCanvas();
										// Set preview Image and Hide Modal
										component.setState({
											previewSrc  : canvas.toDataURL(file.type),
											showCropper : false
										});
										// We destroy the cropper!
										cropper.destroy();
										// Transform it to Blob object
										canvas.toBlob(resolve, file.type);
									}
								}.bind(component),
								onCancelCrop : function () {
									cropper.destroy();
									if (!signal.aborted) {
										component.setState({showCropper : false});
									}
									reject()
								}.bind(component)
							});
						}
					});
				}
			};

			if (!signal.aborted) {
				component.setState({showCropper : true});
			}

			// Read uploaded file (triggers code above)
			reader.readAsDataURL(file);
		})
	};

	beforeUpload = (file) => {
		const {intl} = this.props;
		const status = file.type === 'image/jpeg' || file.type === 'image/png';

		if (!status) {
			messageApi.error(intl.formatMessage(messages.invalidType));
		}
		return status;
	};

	getPlaceholder() {
		const {loading, previewSrc} = this.state;
		const {user} = this.props;

		if (previewSrc) {
			return (
				<img src={previewSrc}
				     style={{width : '100%'}}
				     alt="preview"/>
			)
		}

		if (user && user.profile && user.profile.picture) {
			return (
				<img src={user.profile.picture}
				     style={{width : '100%'}}
				     alt="preview"/>
			)
		}

		return (
			<div>
				<Icon className="cp-fs-2x mb-2"
				      type={loading ? 'loading' : 'plus'}/>
				<div className="ant-upload-text">
					<FormattedMessage
						defaultMessage="Upload"
						id="common.upload"/>
				</div>
			</div>
		);
	}

	handleUploadSuccess = () => {
		const {intl} = this.props;
		messageApi.success(intl.formatMessage(messages.successful))
	};

	handleUploadError = (errors) => {
		if (has(errors, 'file')) {
			errors.file.forEach(error => messageApi.error(error));
		}
	};

	componentWillUnmount() {
		this.controller.abort();
	}

	render() {
		const {user} = this.props;

		const endpoint = route('user.profile.upload-picture', {
			name : user.name
		}).url();

		const {
			showCropper, cropperSrc, onOkCrop, onCancelCrop
		} = this.state;

		return (
			<Widget
				title={
					<FormattedMessage
						defaultMessage="Upload Picture"
						id="profile.upload_picture"/>
				}>
				<div>
					<Upload
						showUploadList={false}
						beforeUpload={this.beforeUpload}
						action={endpoint}
						className="d-flex justify-content-center"
						customRequest={uploadRequest}
						withCredentials={true}
						onError={this.handleUploadError}
						transformFile={this.transformFile}
						listType="picture-card"
						onSuccess={this.handleUploadSuccess}
						accept=".jpg,.jpeg,.png">
						{this.getPlaceholder()}
					</Upload>
				</div>
				<Modal visible={showCropper}
				       title={
					       <FormattedMessage
						       defaultMessage="Crop Image"
						       id="profile.crop_image"/>
				       }
				       onOk={onOkCrop}
				       onCancel={onCancelCrop}
				       okText={
					       <span>
						       <FormattedMessage
							       defaultMessage="Crop"
							       id="common.crop"/>
					       </span>
				       }>
					<div>
						<img ref={this.cropperImg}
						     src={cropperSrc}
						     style={{maxWidth : '90%'}}
						     alt="Upload"/>
					</div>
				</Modal>
			</Widget>
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
)(UploadPhoto);