import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from "react-intl";
import ApiService from "admin/support/Services/Api";
import {isEmpty} from "lodash";
import {handleFormError, handleFormSuccess} from "admin/support/utils/promise";
import {Form, Input, Modal, Typography} from "antd";
import {pipe} from "admin/support/utils/common";
import formHelper from "admin/support/Helpers/Form";

const {Paragraph} = Typography;

const messages = defineMessages({
    successful : {
        defaultMessage : "Your action was successful.",
        id             : "profile.developer.oauth_action_successful"
    },
});

class NewTokenModal extends Component {
    constructor(props) {
        super(props);

        this.api = new ApiService();

        this.state = {
            confirmLoading : false,
            accessToken    : null,
        }
    }

    handleSubmit = () => {
        const {axios, route} = this.api;
        const endpoint = "/oauth/personal-access-tokens";
        const {form, intl} = this.props;

        form.validateFields((errors, values) => {
            if (isEmpty(errors)) {
                axios.post(endpoint, values)
                    .then(response => handleFormSuccess(response, form, ({accessToken}) => {
                        this.setState({confirmLoading : false, accessToken});
                        this.triggerSuccess();
                    }, intl.formatMessage(messages.successful)))
                    .catch(error => handleFormError(error, form, values, () => {
                        this.setState({confirmLoading : false});
                    }));

                this.setState({confirmLoading : true});
            }
        });
    };

    triggerSuccess() {
        const {onSuccess} = this.props;
        if (typeof onSuccess === "function") {
            return onSuccess();
        }
    }

    componentWillUnmount() {
        this.api.cancel()
    }

    onCancel = () => {
        this.setState({accessToken: null});
        this.props.onCancel();
    };

    render() {
        const {visible, form} = this.props;
        const {accessToken, confirmLoading} = this.state;
        const {getFieldDecorator} = form;

        return (
            <Modal className="cp-modal-sm"
                   title={
                       <FormattedMessage
                           defaultMessage="Create New Token"
                           id="profile.developer.oauth_create_new_client"/>
                   }
                   visible={visible}
                   confirmLoading={confirmLoading}
                   okButtonProps={{disabled: !isEmpty(accessToken)}}
                   onCancel={this.onCancel}
                   onOk={this.handleSubmit}
                   okText={
                       <span>
                           <FormattedMessage
                               defaultMessage="Create"
                               id="common.create"/>
                       </span>
                   }>
                {isEmpty(accessToken) ? (
                    <Form.Item labelCol={{xs : 8}}
                               wrapperCol={{xs : 16}}
                               labelAlign="left"
                               label={
                                   <FormattedMessage
                                       defaultMessage="Name"
                                       id="common.name"/>
                               }>
                        {getFieldDecorator('name', {
                            rules : [{required : true}],
                        })(<Input/>)}
                    </Form.Item>
                ) : (
                    <Paragraph copyable>
                        {accessToken}
                    </Paragraph>
                )}

            </Modal>
        );
    }
}

export default pipe(
    formHelper(),
)(NewTokenModal);
